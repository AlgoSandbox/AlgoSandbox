import fs from 'fs';
import path from 'path';
import BoxPage from './BoxPage';

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

async function getAlgoSandboxDeclarations() {
  const libContents = readFilesRecursively('./lib/algo-sandbox');

  const typeDeclarations: TypeDeclaration[] = Object.entries(libContents).map(
    ([filePath, contents]) => {
      return { path: `file:///${filePath}`, contents };
    }
  );

  return typeDeclarations;
}

export type TypeDeclaration = {
  path: string;
  contents: string;
};

export default async function Page() {
  const typeDeclarations = await getAlgoSandboxDeclarations();

  return <BoxPage typeDeclarations={typeDeclarations} />;
}
