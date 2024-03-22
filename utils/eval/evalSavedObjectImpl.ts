import { ErrorOr } from '@app/errors';
import { Value } from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObjectSaved, DbSandboxObjectType } from '../db';
import { EvalWithAlgoSandbox } from './evalWithAlgoSandboxServerSide';

export function evalSavedObjectImpl<T extends DbSandboxObjectType>(
  object: DbSandboxObjectSaved<T>,
  evalFn: EvalWithAlgoSandbox,
): ErrorOr<Value<T>> {
  return evalFn(object.files['index.ts']) as ErrorOr<Value<T>>;
}
