export default async function getTypeDefinitionsWithWorker(
  packageName: string,
) {
  const worker = new Worker(
    new URL('/utils/npm-fetcher/unpkg-fetcher.worker.ts', import.meta.url),
  );

  return new Promise<Record<string, Record<string, string>>>(
    (resolve, reject) => {
      worker.postMessage(packageName);
      worker.onmessage = (
        event: MessageEvent<Record<string, Record<string, string>>>,
      ) => {
        resolve(event.data);
        worker.terminate();
      };
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
    },
  );
}
