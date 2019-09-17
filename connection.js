let ipc = require('node-ipc');
let uuid = require('uuid');
let getSocket = require('./get-socket');

process.traceProcessWarnings = true;
ipc.config.silent = true;
let socketClient = null;
let replyHandlers = new Map();
let initialized = null;

function send(name, args) {
  return new Promise((resolve, reject) => {
    let id = uuid.v4();
    replyHandlers.set(id, { resolve, reject });
    if (socketClient) {
      socketClient.emit('message', JSON.stringify({ id, name, args }));
    }
  });
}

async function init(socketName) {
  // Support calling this multiple times before it actually connects
  if (initialized) {
    return initialized;
  }
  initialized = getSocket(socketName);
  socketClient = await initialized;

  if (!socketClient) {
    // TODO: This could spawn Actual automatically. The ideal solution
    // would be to bundle the entire backend and embed it directly
    // into the distributed library.
    throw new Error("Couldn't connect to Actual. Please run the app first.");
  }

  socketClient.on('message', data => {
    const msg = JSON.parse(data);

    if (msg.type === 'error') {
      // The API should not be getting this message type anymore.
      // Errors are propagated through the `reply` message which gives
      // more context for which call made the error. Just in case,
      // keep this code here for now.
      const { id } = msg;
      replyHandlers.delete(id);
    } else if (msg.type === 'reply') {
      const { id, error, result } = msg;

      const handler = replyHandlers.get(id);
      if (handler) {
        replyHandlers.delete(id);

        if (error) {
          handler.reject(error);
        } else {
          handler.resolve(result);
        }
      }
    } else if (msg.type === 'push') {
      // Do nothing
    } else {
      throw new Error('Unknown message type: ' + JSON.stringify(msg));
    }
  });
}

function disconnect() {
  ipc.disconnect(socketClient.id);
  socketClient = null;
  initialized = false;
}

async function _run(func) {
  let hasError = false;
  let res;

  try {
    await init();
    res = await func();
  } catch (e) {
    if (e.type) {
      if (e.type === 'APIError') {
        console.log('[ERROR] APIError:', e.message);
      } else if (e.type === 'InternalError') {
        console.log('[ERROR] InternalError:', e.message);
      }
    } else {
      console.log(e);
    }

    hasError = true;
    throw e;
  } finally {
    await send('api/cleanup', { hasError });
    disconnect();
  }

  return res;
}

async function runWithBudget(id, func) {
  return _run(async () => {
    await send('api/load-budget', { id });
    return func();
  });
}

async function runImport(name, func) {
  return _run(async () => {
    await send('api/start-import', { budgetName: name });
    await func();
    await send('api/finish-import');
  });
}

module.exports = { init, send, disconnect, runWithBudget, runImport };
