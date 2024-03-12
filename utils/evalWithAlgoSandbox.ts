import * as adapters from '@algo-sandbox/adapters/example';
import * as algorithms from '@algo-sandbox/algorithms';
import * as core from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
import * as reactComponents from '@algo-sandbox/react-components';
import * as states from '@algo-sandbox/states';
import * as visualizers from '@algo-sandbox/visualizers';
import {
  error,
  ErrorEntry,
  errorEntrySchema,
  ErrorOr,
  success,
} from '@app/errors/ErrorContext';
import * as d3 from 'd3';
import _, * as lodash from 'lodash';
import path from 'path';
import * as react from 'react';
import * as reactDomClient from 'react-dom/client';
import * as reactInspector from 'react-inspector';
import { ModuleKind, ScriptTarget, transpile } from 'typescript';
import * as zod from 'zod';

import hyphenCaseToCamelCase from './hyphenCaseToCamelCase';

export function evalWithContext(
  code: string,
  context: Record<string, unknown> = {},
) {
  return function evaluate() {
    const contextDef = Object.keys(context)
      .map((key) => `${key} = this.${key}`)
      .join(',');
    const def = contextDef ? `let ${contextDef};` : '';

    return eval(`${def}${code}`);
  }.call(context);
}

function isAbsolutePath(libraryPath: string) {
  // Returns if the js library path is absolute
  return !libraryPath.startsWith('.');
}

export default function evalWithAlgoSandbox(
  typescriptCode: string,
  fileContext?: {
    files: Record<string, string>;
    currentFilePath: string;
  },
  asModule = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ErrorOr<any> {
  const libraryToValue = {
    '@algo-sandbox/adapters': adapters,
    '@algo-sandbox/algorithms': algorithms,
    '@algo-sandbox/core': core,
    '@algo-sandbox/problems': problems,
    '@algo-sandbox/states': states,
    '@algo-sandbox/visualizers': visualizers,
    '@algo-sandbox/react-components': reactComponents,
    react: react,
    'react-dom/client': reactDomClient,
    'react-inspector': reactInspector,
    d3: d3,
    lodash: lodash,
    zod: zod,
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
              const value = evalWithAlgoSandbox(
                fileContext.files[tsFilePath],
                undefined,
                true,
              );
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
