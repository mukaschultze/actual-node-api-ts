import ipc from 'node-ipc';
import uuid from 'uuid';
import getSocket, { Client } from './get-socket';

// process.traceProcessWarnings = true;
ipc.config.silent = true;
let socketClient: Client | null = null;
let replyHandlers = new Map();
let initialized: Promise<Client | null> | null = null;

process.on('unhandledRejection', function (error, promise) {
  console.log(error);
});

export function send<T = unknown>(name: string, args?: any | any[]) {
  return new Promise<T>((resolve, reject) => {
    let id = uuid.v4();
    replyHandlers.set(id, { resolve, reject });
    if (socketClient) {
      socketClient.emit('message', JSON.stringify({ id, name, args }));
    }
  }).catch((err) => {
    if (typeof err === 'string' && err.includes('API Error')) {
      // Throwing the error here captures the correct async stack trace.
      // If we just let the promise reject
      throw new Error(err);
    }
    throw err;
  });
}

export async function init(socketName?: string): Promise<void> {
  // Support calling this multiple times before it actually connects
  if (initialized) {
    await initialized;
    return;
  }

  initialized = getSocket(socketName);
  socketClient = await initialized;

  if (!socketClient) {
    // TODO: This could spawn Actual automatically. The ideal solution
    // would be to bundle the entire backend and embed it directly
    // into the distributed library.
    throw new Error("Couldn't connect to Actual. Please run the app first.");
  }

  socketClient.on('message', (data) => {
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
          handler.reject('[API Error] ' + error.message);
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

export function disconnect() {
  if (socketClient) {
    ipc.disconnect(socketClient.id);
    socketClient = null;
    initialized = null;
  }
}

async function _run<T>(func: () => T) {
  let res;

  try {
    await init();
    res = await func();
  } catch (e) {
    send('api/cleanup', { hasError: true });
    disconnect();
    throw e;
  }

  send('api/cleanup');
  disconnect();
  return res;
}

/** After connecting to the budget budgetId, run the function. This function can
 * assume all API methods are ready to use. */
export async function runWithBudget<T = unknown>(id: any, func: () => T) {
  return _run(async () => {
    await send('api/load-budget', { id });
    return func();
  });
}

/** Create the budget budgetName, connect to it, and run the function. This puts
 * the API in a special "import mode" that does some maintenance work to create
 * a new budget, and bulk importing data runs much faster. */
export async function runImport<T = unknown>(name: any, func: () => T) {
  return _run(async () => {
    await send('api/start-import', { budgetName: name });
    await func();
    await send('api/finish-import');
  });
}
