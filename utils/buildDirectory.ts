import path from 'path';

import {
  BoxExplorerDirectory,
  BoxExplorerFile,
  BoxExplorerItem,
} from '../typings/directory';

type Directory = Record<string, string | Record<string, string>>;

export function buildDirectory(
  files: Record<string, string>
): BoxExplorerDirectory {
  const directoryStructure: Directory = {};

  for (const [filePath, contents] of Object.entries(files)) {
    const segments = filePath.split(path.delimiter);
    const directorySegments = segments.slice(0, -1);
    const fileName = segments[segments.length - 1];
    let directory = directoryStructure;
    for (const segment of directorySegments) {
      directory = directory[segment] as Directory;
    }
    directory[fileName] = contents;
  }

  function toBoxExplorerItem(
    parentPath: string,
    name: string,
    item: string | Record<string, unknown>
  ): BoxExplorerItem {
    if (typeof item === 'string') {
      return {
        name,
        path: path.join(parentPath, name),
        type: 'file',
        contents: item,
      } satisfies BoxExplorerFile;
    } else {
      return {
        name,
        path: path.join(parentPath, name),
        type: 'directory',
        items: Object.entries(item).map(([itemName, contents]) =>
          toBoxExplorerItem(
            path.join(parentPath, name),
            itemName,
            contents as string | Record<string, unknown>
          )
        ),
      } satisfies BoxExplorerDirectory;
    }
  }

  return toBoxExplorerItem('', '', directoryStructure) as BoxExplorerDirectory;
}
