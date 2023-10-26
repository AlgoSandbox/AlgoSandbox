import * as adapters from '@algo-sandbox/adapters';
import * as algorithms from '@algo-sandbox/algorithms';
import * as core from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
import * as visualizers from '@algo-sandbox/visualizers';
import * as d3 from 'd3';
import * as lodash from 'lodash';
import path from 'path';
import { ModuleKind, ScriptTarget, transpile } from 'typescript';

export function evalWithContext(
  code: string,
  context: Record<string, unknown> = {}
) {
  return function evaluate() {
    const contextDef = Object.keys(context)
      .map((key) => `${key} = this.${key}`)
      .join(',');
    const def = contextDef ? `let ${contextDef};` : '';

    return eval(`${def}${code}`);
  }.call(context);
}

export default function evalWithAlgoSandbox(
  typescriptCode: string,
  fileContext?: {
    files: Record<string, string>;
    currentFilePath: string;
  },
  asModule = false
) {
  const libraryToValue = {
    '@algo-sandbox/adapters': adapters,
    '@algo-sandbox/algorithms': algorithms,
    '@algo-sandbox/core': core,
    '@algo-sandbox/problems': problems,
    '@algo-sandbox/visualizers': visualizers,
    d3: d3,
    lodash: lodash,
  };

  // Make a fake require
  const context = {
    require: (library: string) => {
      if (library in libraryToValue) {
        return libraryToValue[library as keyof typeof libraryToValue];
      } else {
        const isRelative = !path.isAbsolute(library);
        if (isRelative && fileContext) {
          const resolvedPath = path.resolve(
            path.dirname(fileContext.currentFilePath),
            library
          );

          const tsFilePathChoices = [
            resolvedPath + '.ts',
            resolvedPath + '/index.ts',
            resolvedPath + '/index.js',
          ];

          for (const tsFilePath of tsFilePathChoices) {
            if (tsFilePath in fileContext.files) {
              const value = evalWithAlgoSandbox(
                fileContext.files[tsFilePath],
                undefined,
                true
              );
              return value;
            }
          }
        }
        return undefined;
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

  const generatedObject = evalWithContext(toEval, context);

  return generatedObject;
}
