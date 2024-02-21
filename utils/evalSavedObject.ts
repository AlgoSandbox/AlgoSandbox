import { ErrorOr } from '@app/errors/ErrorContext';
import {
  DbObjectSaved,
  Value,
} from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObjectType } from './db';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export function evalSavedObject<T extends DbSandboxObjectType>(
  object: DbObjectSaved<T>,
): ErrorOr<Value<T>> {
  return evalWithAlgoSandbox(object.files['index.ts']) as ErrorOr<Value<T>>;
}
