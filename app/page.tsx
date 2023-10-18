import { CatalogGroup } from '@constants/catalog';
import { DbSavedAlgorithm } from '@utils/db';
import fs from 'fs';
import {  GlobOptionsWithFileTypesUnset, globSync } from 'glob';
import path from 'path';

import BoxPage from './BoxPage';

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

function readFilesMatchingPatterns(patterns: Array<[string] | [string, GlobOptionsWithFileTypesUnset]>): Record<string, string> {
  return Object.fromEntries(patterns.flatMap(([pattern, options]) => {
    const fileNames = globSync(pattern, options);
    return fileNames;
  }).map((fileName) => {
    const contents = fs.readFileSync(fileName, 'utf-8');
    return [fileName, contents];
  }))
}

async function getAlgoSandboxDeclarations() {
  const libContents = readFilesRecursively('./lib/algo-sandbox');

  const typeDeclarations: TypeDeclaration[] = Object.entries(libContents).map(
    ([filePath, contents]) => {
      return { path: `file:///${filePath}`, contents };
    }
  );

  return typeDeclarations;
}

const markdownHeadingRegex = /^#\s+(.+)$/;

function getMarkdownTitle(markdown: string) {
  const match = markdown.match(markdownHeadingRegex);
  if (match === null) 
  {
    return 'Untitled';
  }

  return match[1].trim();
}


const groupToFolderGlob = {
  'Search': "lib/algo-sandbox/algorithms/search",
  'Example': "lib/algo-sandbox/algorithms/example",
}

function readAlgorithmGroup(groupLabel: string, folderGlob: string) {
  const algorithmContents = readFilesMatchingPatterns([[path.join(folderGlob, "*/*.ts")]]);
  const algorithmWriteups = readFilesMatchingPatterns([["lib/algo-sandbox/algorithms/*/*/*.md"]]);

  const algorithms: Array<DbSavedAlgorithm> = Object.entries(algorithmContents).map(([contentFileName, content]) => {
    const writeup = algorithmWriteups[contentFileName.substring(0, contentFileName.length - 3) + '.md'];
    const title = writeup !== undefined? getMarkdownTitle(writeup) : 'Untitled';
    return ({
      key: contentFileName,
      name: title,
      typescriptCode: content,
    });
  })

  const algorithmOptions: CatalogGroup<DbSavedAlgorithm> = {
    key: groupLabel,
    label: groupLabel,
    options: algorithms.map((algorithm) => ({
      key: algorithm.key,
      label: algorithm.name,
      value: algorithm,
      type: 'built-in'
    }))
  }
  return algorithmOptions;
}

export default async function Page() {
  const typeDeclarations = await getAlgoSandboxDeclarations();

  const builtInAlgorithmOptions = Object.entries(groupToFolderGlob).map(([label, folderGlob]) => readAlgorithmGroup(label, folderGlob));

  return <BoxPage typeDeclarations={typeDeclarations} builtInAlgorithmOptions={builtInAlgorithmOptions}/>;
}
