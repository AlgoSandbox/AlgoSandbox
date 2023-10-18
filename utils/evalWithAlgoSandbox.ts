import * as adapters from '@algo-sandbox/adapters';
import * as core from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
import * as visualizers from '@algo-sandbox/visualizers';
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

export default function evalWithAlgoSandbox(typescriptCode: string) {
  const libraryToValue = {
    '@algo-sandbox/adapters': adapters,
    '@algo-sandbox/core': core,
    '@algo-sandbox/problems': problems,
    '@algo-sandbox/visualizers': visualizers,
  };

  // Make a fake require
  const context = {
    require: (library: string) => {
      return libraryToValue[library as keyof typeof libraryToValue];
    },
  };

  const transpiled = transpile(typescriptCode, {
    target: ScriptTarget.ESNext,
    module: ModuleKind.CommonJS,
  });

  const toEval = `(() => { var exports = {}; ${transpiled} ; return exports.default; } )()`;

  const generatedObject = evalWithContext(toEval, context);

  return generatedObject;
}
