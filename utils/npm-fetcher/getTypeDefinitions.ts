import _ from 'lodash';
import path from 'path';

import getImportNames from './getImportNames';
import getTypeDirectives from './getTypeDirectives';

async function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('algoSandbox', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('packages', { keyPath: 'key' });
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function hasCachedFile(packageName: string, filePath: string) {
  console.debug(
    `%c ${path.join(packageName, filePath)}: checking cache...`,
    'background: orange; color: white',
  );
  const cacheKey = path.join(packageName, filePath);
  const db = await openDatabase();

  return new Promise((resolve) => {
    const transaction = db.transaction('packages');
    const objectStore = transaction.objectStore('packages');
    const request = objectStore.get(cacheKey);

    request.onsuccess = () => {
      if (request.result !== undefined) {
        console.debug(
          `%c ${path.join(packageName, filePath)}: cached`,
          'background: green; color: white',
        );
      } else {
        console.debug(
          `%c ${path.join(packageName, filePath)}: not in cache`,
          'background: orange; color: white',
        );
      }
      resolve(request.result !== undefined);
    };

    request.onerror = () => {
      resolve(false);
    };
  });
}

async function fetchFile(packageName: string, filePath: string) {
  console.debug(
    `%c ${path.join(packageName, filePath)}: fetching from unpkg...`,
    'background: orange; color: white',
  );
  const res = await fetch(
    `https://unpkg.com/${path.join(packageName, filePath)}`,
  );
  const text = await res.text();

  if (res.status === 404) {
    console.debug(
      `%c ${path.join(packageName, filePath)}: failed to fetch from unpkg`,
      'background: red; color: white',
    );
    return null;
  }

  console.debug(
    `%c ${path.join(packageName, filePath)}: fetched from unpkg`,
    'background: green; color: white',
  );
  return text;
}

async function getCachedOrFetchFile(packageName: string, filePath: string) {
  const cacheKey = path.join(packageName, filePath);
  const db = await openDatabase();

  return new Promise<string | null>((resolve, reject) => {
    const readTransaction = db.transaction('packages', 'readonly');
    const objectStore = readTransaction.objectStore('packages');

    const request: IDBRequest<{ key: string; value: string } | undefined> =
      objectStore.get(cacheKey);

    request.onsuccess = async () => {
      const cachedValue = request.result;
      if (cachedValue) {
        console.debug(
          `%c ${path.join(packageName, filePath)}: loaded from cache`,
          'background: green; color: white',
        );
        resolve(cachedValue.value);
      } else {
        const value = await fetchFile(packageName, filePath);
        if (value === null) {
          resolve(null);
        } else {
          const writeTransaction = db.transaction('packages', 'readwrite');
          const objectStore = writeTransaction.objectStore('packages');
          objectStore.put({ key: cacheKey, value });
          resolve(value);
        }
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function recursivelyFetchTypeDefinitions(
  packageName: string,
  filePath: string,
  files: Record<string, Record<string, string>>,
) {
  if (!(packageName in files)) {
    files[packageName] = {};
  }
  const packageFiles = files[packageName];
  if (filePath in packageFiles) {
    return true;
  }

  const code = await getCachedOrFetchFile(packageName, filePath);
  if (code === null) {
    return false;
  }

  packageFiles[filePath] = code;

  const importPaths = (() => {
    try {
      return getImportNames(code);
    } catch (e) {
      console.debug('Error when parsing', packageName, filePath);
      console.debug(e);
      return [];
    }
  })();
  const typeDirectives = getTypeDirectives(code);

  await Promise.all(
    [...importPaths, ...typeDirectives].map(async (importPath) => {
      const isAbsolute = !importPath.startsWith('.');
      if (isAbsolute) {
        const importPathFiles = await getTypeDefinitions(importPath);

        _.merge(files, importPathFiles);

        return true;
      }
      const resolvedPath = path.resolve(path.dirname(filePath), importPath);

      // Try to get [importPath].ts and [importPath]/index.d.ts
      const tsFilePathChoices = [
        path.resolve(resolvedPath, 'index.d.ts'),
        `${resolvedPath}.d.ts`,
      ];

      const hasCachedPaths = await Promise.all(
        tsFilePathChoices.map(async (tsFilePath) => {
          const hasCached = await hasCachedFile(packageName, tsFilePath);
          if (hasCached) {
            return tsFilePath;
          }
          return null;
        }),
      );

      const correctFilePath = hasCachedPaths.find((x) => x !== null);

      if (correctFilePath) {
        await recursivelyFetchTypeDefinitions(
          packageName,
          correctFilePath,
          files,
        );
        return true;
      } else {
        for (const tsFilePath of tsFilePathChoices) {
          const found = await recursivelyFetchTypeDefinitions(
            packageName,
            tsFilePath,
            files,
          );
          if (found) {
            break;
          }
        }
      }
    }),
  );

  return true;
}

async function getPackageDeclarationFiles(packageName: string) {
  const files: Record<string, Record<string, string>> = {};

  console.group('Fetching type definitions for', packageName, '...');

  // Recursively fetch all dependencies
  const found = await recursivelyFetchTypeDefinitions(
    packageName,
    './index.d.ts',
    files,
  );

  console.groupEnd();

  if (!found) {
    return null;
  }

  return files;
}

export default async function getTypeDefinitions(
  packageName: string,
): Promise<Record<string, Record<string, string>>> {
  const packageNameChoices = [packageName, `@types/${packageName}`];

  // Check if any of the package names are cached
  const cachedPackageNames = await Promise.all(
    packageNameChoices.map(async (packageName) => {
      const hasCached = await hasCachedFile(packageName, './index.d.ts');
      if (hasCached) {
        return packageName;
      }
      return null;
    }),
  );

  // If found, return the cached package name
  const cachedPackageName = cachedPackageNames.find((x) => x !== null);

  if (cachedPackageName) {
    return (await getPackageDeclarationFiles(cachedPackageName)) ?? {};
  }

  // Else: try to fetch from unpkg
  const typeDefinitions = await Promise.all(
    packageNameChoices.map(async (packageName) => {
      return await getPackageDeclarationFiles(packageName);
    }),
  );

  return typeDefinitions.find((x) => x !== null) ?? {};
}
