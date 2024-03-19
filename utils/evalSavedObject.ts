import { ErrorOr } from '@app/errors';
import { Value } from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObjectSaved, DbSandboxObjectType } from './db';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export function evalSavedObject<T extends DbSandboxObjectType>(
  object: DbSandboxObjectSaved<T>,
): ErrorOr<Value<T>> {
  return evalWithAlgoSandbox(object.files['index.ts']) as ErrorOr<Value<T>>;
}
