import * as adapters from '@algo-sandbox/adapters';
import * as algorithms from '@algo-sandbox/algorithms';
import * as core from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
// import * as reactComponents from '@algo-sandbox/react-components';
import * as states from '@algo-sandbox/states';
// import * as visualizers from '@algo-sandbox/visualizers';
import {
  error,
  ErrorEntry,
  errorEntrySchema,
  ErrorOr,
  success,
} from '@app/errors';
import hyphenCaseToCamelCase from '@utils/hyphenCaseToCamelCase';
import _ from 'lodash';
import { ModuleKind, ScriptTarget, transpile } from 'typescript';

import evalWithContext from './evalWithContext';

function isAbsolutePath(libraryPath: string) {
  // Returns if the js library path is absolute
  return !libraryPath.startsWith('.');
}

export default function evalServerSide<T>(
  typescriptCode: string,
  asModule = false,
): ErrorOr<T> {
  const libraryToValue = {
    '@algo-sandbox/adapters': adapters,
    '@algo-sandbox/algorithms': algorithms,
    '@algo-sandbox/core': core,
    '@algo-sandbox/problems': problems,
    '@algo-sandbox/states': states,
    // '@algo-sandbox/visualizers': visualizers,
    // '@algo-sandbox/react-components': reactComponents,
    // react: react,
    // 'react-dom/client': reactDomClient,
    // 'react-inspector': reactInspector,
    // d3: d3,
    // lodash: lodash,
    // zod: zod,
  };

  // Make a fake require
  const context = {
    require: (library: string) => {
      if (library in libraryToValue) {
        return libraryToValue[library as keyof typeof libraryToValue];
      } else {
        const isAbsolute = isAbsolutePath(library);
        if (isAbsolute) {
          const matchingLibraryPrefixes = Object.keys(libraryToValue).filter(
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
            return libraryToValue[
              bestMatchingLibraryPrefix as keyof typeof libraryToValue
            ];
          }
          const dottedRelativePath = library
            .slice(bestMatchingLibraryPrefix.length + 1)
            .replaceAll('/', '.');
          const libraryValue =
            libraryToValue[
              bestMatchingLibraryPrefix as keyof typeof libraryToValue
            ];

          const camelCaseRelativePath =
            hyphenCaseToCamelCase(dottedRelativePath);

          const object =
            _.get(libraryValue, dottedRelativePath) ??
            _.get(libraryValue, camelCaseRelativePath);

          if (object !== undefined) {
            object.default = object;
          }
          return object;
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
