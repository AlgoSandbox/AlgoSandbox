import './globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import clsx from 'clsx';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import NextThemeProvider from './NextThemeProvider';
import Providers from './Providers';

const inter = Inter({ subsets: ['latin'] });

import { ComponentConfig } from '@algo-sandbox/core';
import Toaster from '@components/ui/Toaster';
import { CatalogOption } from '@constants/catalog';
import { DbSandboxObjectSaved, DbSandboxObjectType } from '@utils/db';
import evalServerSide from '@utils/eval/evalServerSide';
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
  'Decision trees': 'lib/algo-sandbox/algorithms/decision-trees',
  // 'Adversarial search': 'lib/algo-sandbox/algorithms/adversarial-search',
  Sorting: 'lib/algo-sandbox/algorithms/sorting',
};

const problemGroupToFolderGlob = {
  Backtracking: 'lib/algo-sandbox/problems/backtracking',
  Graphs: 'lib/algo-sandbox/problems/graphs',
  Grid: 'lib/algo-sandbox/problems/grid',
  Tabular: 'lib/algo-sandbox/problems/tabular',
  'Weighted graphs': 'lib/algo-sandbox/problems/weighted-graphs',
  Arrays: 'lib/algo-sandbox/problems/arrays',
};

const visualizerGroupToFolderGlob = {
  Graphs: 'lib/algo-sandbox/visualizers/graphs',
  Primitives: 'lib/algo-sandbox/visualizers/primitives',
  Grid: 'lib/algo-sandbox/visualizers/grid',
  Charts: 'lib/algo-sandbox/visualizers/charts',
};

const adapterGroupToFolderGlob = {
  Environment: 'lib/algo-sandbox/adapters/environment',
  Tools: 'lib/algo-sandbox/adapters/utils',
  Sorting: 'lib/algo-sandbox/adapters/sorting',
};

const boxGroupToFolderGlob = {
  Environment: 'lib/algo-sandbox/boxes/environment',
  'Decision trees': 'lib/algo-sandbox/boxes/decision-trees',
  Sorting: 'lib/algo-sandbox/boxes/sorting',
};

function readSandboxObjectGroup<T extends DbSandboxObjectType>(
  type: T,
  groupLabel: string,
  folderGlob: string,
) {
  const contents = readFilesMatchingPatterns([
    [path.join(folderGlob, '*/index.ts')],
  ]);
  const configs = readFilesMatchingPatterns([
    [path.join(folderGlob, '*/config.ts')],
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

      const tags = (() => {
        const configContents = configs[folder + 'config.ts'];

        if (configContents === undefined) {
          return [];
        }

        const { tags } = evalServerSide<ComponentConfig>(
          configContents,
        ).unwrapOr({
          tags: [],
        });

        return tags;
      })();

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
        tags,
      };
    },
  );

  const options: Array<CatalogOption<DbSandboxObjectSaved<T>>> = objects.map(
    (object) => ({
      key: object.key,
      label: object.name,
      value: object,
      type: 'built-in',
    }),
  );

  return options;
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
  ).flatMap(([label, folderGlob]) =>
    readSandboxObjectGroup('algorithm', label, folderGlob),
  );
  const buildInBoxOptions = Object.entries(boxGroupToFolderGlob).flatMap(
    ([label, folderGlob]) => readSandboxObjectGroup('box', label, folderGlob),
  );
  const builtInProblemOptions = Object.entries(
    problemGroupToFolderGlob,
  ).flatMap(([label, folderGlob]) =>
    readSandboxObjectGroup('problem', label, folderGlob),
  );
  const builtInVisualizerOptions = Object.entries(
    visualizerGroupToFolderGlob,
  ).flatMap(([label, folderGlob]) =>
    readSandboxObjectGroup('visualizer', label, folderGlob),
  );
  const builtInAdapterOptions = Object.entries(
    adapterGroupToFolderGlob,
  ).flatMap(([label, folderGlob]) =>
    readSandboxObjectGroup('adapter', label, folderGlob),
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics gaId="G-2Z2RW7QVTJ" />
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
