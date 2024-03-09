import './globals.css';

import clsx from 'clsx';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import NextThemeProvider from './NextThemeProvider';
import Providers from './Providers';

const inter = Inter({ subsets: ['latin'] });

import { Toaster } from '@components/ui/Toaster';
import { CatalogGroup } from '@constants/catalog';
import { DbSandboxObjectSaved, DbSandboxObjectType } from '@utils/db';
import hyphenCaseToCamelCase from '@utils/hyphenCaseToCamelCase';
import fs from 'fs';
import { GlobOptionsWithFileTypesUnset, globSync } from 'glob';
import path from 'path';

export const metadata: Metadata = {
  title: 'Algo Sandbox',
  description:
    'Visualize algorithms in a highly customizable all-in-one sandbox.',
};

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
  Backtracking: 'lib/algo-sandbox/problems/backtracking',
  Example: 'lib/algo-sandbox/problems/example',
  Graphs: 'lib/algo-sandbox/problems/graphs',
  'Weighted graphs': 'lib/algo-sandbox/problems/weighted-graphs',
};

const visualizerGroupToFolderGlob = {
  Graphs: 'lib/algo-sandbox/visualizers/graphs',
  Primitives: 'lib/algo-sandbox/visualizers/primitives',
};

const adapterGroupToFolderGlob = {
  Example: 'lib/algo-sandbox/adapters/example',
  Environment: 'lib/algo-sandbox/adapters/environment',
  Tools: 'lib/algo-sandbox/adapters/utils',
};

const boxGroupToFolderGlob = {
  Graphs: 'lib/algo-sandbox/boxes/graphs',
  Environment: 'lib/algo-sandbox/boxes/environment',
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

      // Extract out key using regex
      // Key is "lib/algo-sandbox/componentType/{key}/index.ts"
      const keyWithSlashes =
        contentFileName.match(
          /^lib\/algo-sandbox\/(?:.+?)\/(.+)\/index.ts$/,
        )?.[1] ?? '';

      const key =
        type + '.' + hyphenCaseToCamelCase(keyWithSlashes).replaceAll('/', '.');

      return {
        key,
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const algoSandboxFiles = await getAlgoSandboxFiles();

  const typeDeclarations: Array<TypeDeclaration> = [];

  const builtInAlgorithmOptions = Object.entries(
    algorithmGroupToFolderGlob,
  ).map(([label, folderGlob]) =>
    readSandboxObjectGroup('algorithm', label, folderGlob),
  );
  const buildInBoxOptions = Object.entries(boxGroupToFolderGlob).map(
    ([label, folderGlob]) => readSandboxObjectGroup('box', label, folderGlob),
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={clsx(inter.className, 'bg-canvas')}>
        <NextThemeProvider>
          <Providers
            builtInAdapterOptions={builtInAdapterOptions}
            builtInAlgorithmOptions={builtInAlgorithmOptions}
            builtInBoxOptions={buildInBoxOptions}
            builtInProblemOptions={builtInProblemOptions}
            builtInVisualizerOptions={builtInVisualizerOptions}
            algoSandboxFiles={algoSandboxFiles}
            typeDeclarations={typeDeclarations}
          >
            {children}
            <Toaster />
          </Providers>
        </NextThemeProvider>
      </body>
    </html>
  );
}
