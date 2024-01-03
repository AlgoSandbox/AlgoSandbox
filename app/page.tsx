import { CatalogGroup } from '@constants/catalog';
import { DbSandboxObjectSaved, DbSandboxObjectType } from '@utils/db';
import fs from 'fs';
import { GlobOptionsWithFileTypesUnset, globSync } from 'glob';
import path from 'path';

import Playground from './Playground';

export type TypeDeclaration = {
  path: string;
  contents: string;
};

function readFilesRecursively(directoryPath: string) {
  const fileContentsMap: Record<string, string> = {};

  // Read the contents of the directory
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      // If it's a directory, recursively call the function on it
      const nestedContents = readFilesRecursively(filePath);
      Object.assign(fileContentsMap, nestedContents);
    } else {
      // If it's a file, read its contents and store in the map
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      fileContentsMap[filePath] = fileContents;
    }
  });

  return fileContentsMap;
}

function readFilesMatchingPatterns(
  patterns: Array<[string] | [string, GlobOptionsWithFileTypesUnset]>,
): Record<string, string> {
  return Object.fromEntries(
    patterns
      .flatMap(([pattern, options]) => {
        const fileNames = globSync(pattern, options);
        return fileNames;
      })
      .map((fileName) => {
        const contents = fs.readFileSync(fileName, 'utf-8');
        return [fileName, contents];
      }),
  );
}

async function getAlgoSandboxFiles() {
  const libContents = readFilesRecursively('./lib/algo-sandbox');

  const typeDeclarations: TypeDeclaration[] = Object.entries(libContents).map(
    ([filePath, contents]) => {
      return { path: `file:///${filePath}`, contents };
    },
  );

  return typeDeclarations;
}

const markdownHeadingRegex = /^#\s+(.+)\s*$/m;

function getMarkdownTitle(markdown: string) {
  const match = markdown.match(markdownHeadingRegex);

  if (match === null) {
    return 'Untitled';
  }

  return match[1].trim();
}

const algorithmGroupToFolderGlob = {
  Search: 'lib/algo-sandbox/algorithms/search',
  Example: 'lib/algo-sandbox/algorithms/example',
};

const problemGroupToFolderGlob = {
  Graphs: 'lib/algo-sandbox/problems/graphs',
  Example: 'lib/algo-sandbox/problems/example',
};

const visualizerGroupToFolderGlob = {
  Graphs: 'lib/algo-sandbox/visualizers/graphs',
};

const adapterGroupToFolderGlob = {
  Example: 'lib/algo-sandbox/adapters/example',
};

function readSandboxObjectGroup<T extends DbSandboxObjectType>(
  type: T,
  groupLabel: string,
  folderGlob: string,
) {
  const contents = readFilesMatchingPatterns([
    [path.join(folderGlob, '*/index.ts')],
  ]);
  const writeups = readFilesMatchingPatterns([
    [path.join(folderGlob, '*/*.md')],
  ]);
  const allFiles = readFilesMatchingPatterns([
    [path.join(folderGlob, '*/*.*')],
  ]);

  const objects: Array<DbSandboxObjectSaved<T>> = Object.entries(contents).map(
    ([contentFileName]) => {
      const folder = contentFileName.substring(0, contentFileName.length - 8);
      const writeup = writeups[folder + 'index.md'];
      const title =
        writeup !== undefined ? getMarkdownTitle(writeup) : 'Untitled';
      const files = Object.fromEntries(
        Object.entries(allFiles).filter(([key]) => key.includes(folder)),
      );
      const renamedFiles = Object.fromEntries(
        Object.entries(files).map(([fileName, value]) => [
          fileName.substring(folder.length),
          value,
        ]),
      );

      return {
        key: contentFileName,
        name: title,
        writeup,
        files: renamedFiles,
        editable: false,
        type,
      };
    },
  );

  const objectOptions: CatalogGroup<DbSandboxObjectSaved<T>> = {
    key: groupLabel,
    label: groupLabel,
    options: objects.map((object) => ({
      key: object.key,
      label: object.name,
      value: object,
      type: 'built-in',
    })),
  };
  return objectOptions;
}

export default async function Page() {
  const algoSandboxFiles = await getAlgoSandboxFiles();

  // TODO: Fetch d3 and lodash type declarations
  const typeDeclarations: Array<TypeDeclaration> = [];

  const builtInAlgorithmOptions = Object.entries(
    algorithmGroupToFolderGlob,
  ).map(([label, folderGlob]) =>
    readSandboxObjectGroup('algorithm', label, folderGlob),
  );
  const builtInProblemOptions = Object.entries(problemGroupToFolderGlob).map(
    ([label, folderGlob]) =>
      readSandboxObjectGroup('problem', label, folderGlob),
  );
  const builtInVisualizerOptions = Object.entries(
    visualizerGroupToFolderGlob,
  ).map(([label, folderGlob]) =>
    readSandboxObjectGroup('visualizer', label, folderGlob),
  );
  const builtInAdapterOptions = Object.entries(adapterGroupToFolderGlob).map(
    ([label, folderGlob]) =>
      readSandboxObjectGroup('adapter', label, folderGlob),
  );

  return (
    <Playground
      algoSandboxFiles={algoSandboxFiles}
      typeDeclarations={typeDeclarations}
      builtInAdapterOptions={builtInAdapterOptions}
      builtInAlgorithmOptions={builtInAlgorithmOptions}
      builtInProblemOptions={builtInProblemOptions}
      builtInVisualizerOptions={builtInVisualizerOptions}
    />
  );
}
