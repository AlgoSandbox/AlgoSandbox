import {
  error,
  ErrorEntry,
  errorEntrySchema,
  ErrorOr,
  success,
} from '@app/errors';
import _ from 'lodash';
import path from 'path';
import { ModuleKind, ScriptTarget, transpile } from 'typescript';

import hyphenCaseToCamelCase from '../hyphenCaseToCamelCase';
import evalWithContext from './evalWithContext';

function isAbsolutePath(libraryPath: string) {
  // Returns if the js library path is absolute
  return !libraryPath.startsWith('.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function evalWithLibraries<T = any>(
  typescriptCode: string,
  options?: {
    fileContext?: {
      files: Record<string, string>;
      currentFilePath: string;
    };
    asModule?: boolean;
    libraries?: Record<string, unknown>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ErrorOr<T> {
  const { fileContext, asModule = false, libraries = {} } = options ?? {};

  // Make a fake require
  const context = {
    require: (library: string) => {
      if (library in libraries) {
        return libraries[library as keyof typeof libraries];
      } else {
        const isAbsolute = isAbsolutePath(library);
        if (isAbsolute) {
          const matchingLibraryPrefixes = Object.keys(libraries).filter(
            (key) =>
              library.startsWith(key) &&
              (library.length === key.length || library[key.length] === '/'),
          );
          if (matchingLibraryPrefixes.length === 0) {
            const errorEntry: ErrorEntry = {
              message: `Unable to import ${library}`,
            };

            throw errorEntry;
          }
          const bestMatchingLibraryPrefix = matchingLibraryPrefixes.toSorted(
            (a, b) => b.length - a.length,
          )[0];
          if (bestMatchingLibraryPrefix.length === library.length) {
            return libraries[
              bestMatchingLibraryPrefix as keyof typeof libraries
            ];
          }
          const dottedRelativePath = library
            .slice(bestMatchingLibraryPrefix.length + 1)
            .replaceAll('/', '.');
          const libraryValue =
            libraries[bestMatchingLibraryPrefix as keyof typeof libraries];

          const camelCaseRelativePath =
            hyphenCaseToCamelCase(dottedRelativePath);

          const object =
            _.get(libraryValue, dottedRelativePath) ??
            _.get(libraryValue, camelCaseRelativePath);

          if (object !== undefined) {
            object.default = object;
          }
          return object;
        } else if (fileContext) {
          const resolvedPath = path.resolve(
            path.dirname(fileContext.currentFilePath),
            library,
          );

          const tsFilePathChoices = [
            path.resolve(resolvedPath, 'index.ts'),
            path.resolve(resolvedPath, 'index.js'),
          ];

          if (!resolvedPath.endsWith('.')) {
            tsFilePathChoices.push(resolvedPath + '.ts');
          }

          for (const tsFilePath of tsFilePathChoices) {
            if (tsFilePath in fileContext.files) {
              const value = evalWithLibraries(fileContext.files[tsFilePath], {
                asModule: true,
                libraries,
              });
              return value;
            }
          }
        }

        const errorEntry: ErrorEntry = {
          message: `Unable to import ${library}`,
        };

        throw errorEntry;
      }
    },
  };

  const transpiled = transpile(typescriptCode, {
    target: ScriptTarget.ESNext,
    module: ModuleKind.CommonJS,
  });

  const toEval = `(() => { const exports = {}; ${transpiled} ; return ${
    asModule ? 'exports' : 'exports.default'
  }; } )()`;

  try {
    const generatedObject = evalWithContext(toEval, context);

    return success(generatedObject);
  } catch (e) {
    const errorEntry = errorEntrySchema.safeParse(e);

    if (errorEntry.success) {
      return error(`Error in code:\n${errorEntry.data.message}`);
    }

    return error('Unknown error occurred while evaluating the code');
  }
}
