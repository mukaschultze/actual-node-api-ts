import ipc from 'node-ipc';

function connect(name) {
  return new Promise((resolve, reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name);
        resolve(false);
      });

      ipc.of[name].on('connect', () => {
        resolve(ipc.of[name]);
      });
    });
  });
}

export default async function getSocket(name) {
  if (name) {
    return connect(name);
  }

  let currentSocket = 1;
  let client = null;
  while (!(client = await connect('actual' + currentSocket))) {
    currentSocket++;

    if (currentSocket >= 10) {
      return null;
    }
  }

  return client;
}
