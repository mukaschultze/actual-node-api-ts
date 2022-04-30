import ipc from 'node-ipc';

export type Client = typeof ipc['of'][string] & { id: string };

function connect(name: string) {
  return new Promise<Client | null>((resolve, reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name);
        resolve(null);
      });

      ipc.of[name].on('connect', () => {
        resolve(ipc.of[name] as Client);
      });
    });
  });
}

export default async function getSocket(name?: string): Promise<Client | null> {
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
