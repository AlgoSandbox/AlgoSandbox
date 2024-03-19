import { error, errorEntrySchema, ErrorOr, success } from '@app/errors';
import { ModuleKind, ScriptTarget, transpile } from 'typescript';

import evalWithContext from './evalWithContext';

export default function evalServerSide<T>(
  typescriptCode: string,
  asModule = false,
): ErrorOr<T> {
  const transpiled = transpile(typescriptCode, {
    target: ScriptTarget.ESNext,
    module: ModuleKind.CommonJS,
  });

  const toEval = `(() => { const exports = {}; ${transpiled} ; return ${
    asModule ? 'exports' : 'exports.default'
  }; } )()`;

  try {
    const generatedObject = evalWithContext(toEval, {});

    return success(generatedObject);
  } catch (e) {
    const errorEntry = errorEntrySchema.safeParse(e);

    if (errorEntry.success) {
      return error(`Error in code:\n${errorEntry.data.message}`);
    }

    return error('Unknown error occurred while evaluating the code');
  }
}
