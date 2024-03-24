import { ErrorOr } from '@app/errors';
import { Value } from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObject, DbSandboxObjectType } from '../db';
import { EvalWithAlgoSandbox } from './evalWithAlgoSandboxServerSide';

export default function evalSavedObjectImpl<T extends DbSandboxObjectType>(
  object: DbSandboxObject<T>,
  evalFn: EvalWithAlgoSandbox,
): ErrorOr<Value<T>> {
  return evalFn(object.files['index.ts']) as ErrorOr<Value<T>>;
}
