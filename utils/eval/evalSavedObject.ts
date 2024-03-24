import { ErrorOr } from '@app/errors';
import { Value } from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObject, DbSandboxObjectType } from '../db';
import evalSavedObjectImpl from './evalSavedObjectImpl';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function evalSavedObject<T extends DbSandboxObjectType>(
  object: DbSandboxObject<T>,
): ErrorOr<Value<T>> {
  return evalSavedObjectImpl(object, evalWithAlgoSandbox);
}
