import ipc from 'node-ipc';

export type Client = typeof ipc['of'][string] & { id?: string };

function connect(name: string) {
  return new Promise<Client | undefined>((resolve, reject) => {
    ipc.connectTo(name, () => {
      ipc.of[name].on('error', () => {
        ipc.disconnect(name);
        resolve(undefined);
      });

      ipc.of[name].on('connect', () => {
        resolve(ipc.of[name]);
      });
    });
  });
}

export default async function getSocket(
  name: string
): Promise<Client | undefined> {
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
