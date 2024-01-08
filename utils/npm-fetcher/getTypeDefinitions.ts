import path from 'path';
import getImportNames from './getImportNames';
import _ from 'lodash';

function hasCachedFile(packageName: string, filePath: string) {
  const cacheKey = `sandbox:packages:${packageName}/${filePath}`;
  return localStorage.getItem(cacheKey) !== null;
}

async function fetchFile(packageName: string, filePath: string) {
  console.info(
    'Fetching declaration',
    `https://unpkg.com/${packageName}/${filePath}`,
  );
  const res = await fetch(`https://unpkg.com/${packageName}/${filePath}`);
  const text = await res.text();

  if (res.status === 404) {
    console.info('Failed to fetch declaration', filePath);
    return null;
  }
  return text;
}

async function getCachedOrFetchFile(packageName: string, filePath: string) {
  const cacheKey = `sandbox:packages:${packageName}/${filePath}`;

  const cachedValue = localStorage.getItem(cacheKey);

  if (cachedValue) {
    console.info('Using cached value for', packageName, filePath);
    return cachedValue;
  }

  const value = await fetchFile(packageName, filePath);
  if (value === null) {
    return null;
  }
  localStorage.setItem(cacheKey, value);

  return value;
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

  const importPaths = getImportNames(code);

  await Promise.all(
    importPaths.map(async (importPath) => {
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

      // Fetch the first one that exists, if any do
      const correctFilePath = tsFilePathChoices.find((tsFilePath) => {
        return hasCachedFile(packageName, tsFilePath);
      });

      if (correctFilePath) {
        await recursivelyFetchTypeDefinitions(
          packageName,
          correctFilePath,
          files,
        );
        return true;
      }

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
    }),
  );

  return true;
}

async function getPackageDeclarationFiles(packageName: string) {
  const files: Record<string, Record<string, string>> = {};

  // Recursively fetch all dependencies
  const found = await recursivelyFetchTypeDefinitions(
    packageName,
    './index.d.ts',
    files,
  );

  if (!found) {
    return null;
  }

  return files;
}

export default async function getTypeDefinitions(
  packageName: string,
): Promise<Record<string, Record<string, string>>> {
  // Try to fetch from package itself
  const typeDefinitions = await getPackageDeclarationFiles(packageName);

  // If not found, try to fetch from @types
  if (typeDefinitions === null) {
    return (await getPackageDeclarationFiles(`@types/${packageName}`)) ?? {};
  }

  return typeDefinitions;
}
