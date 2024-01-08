import getTypeDefinitions from './getTypeDefinitions';

// prevents TS errors
declare var self: Worker;

self.onmessage = async (event: MessageEvent<string>) => {
  const packageName = event.data;
  const typeDefinitions = await getTypeDefinitions(packageName);
  postMessage(typeDefinitions);
};
