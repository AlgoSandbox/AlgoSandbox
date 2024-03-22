import { ErrorOr } from '@app/errors';
import { Value } from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObjectSaved, DbSandboxObjectType } from '../db';
import evalSavedObjectImpl from './evalSavedObjectImpl';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function evalSavedObject<T extends DbSandboxObjectType>(
  object: DbSandboxObjectSaved<T>,
): ErrorOr<Value<T>> {
  return evalSavedObjectImpl(object, evalWithAlgoSandbox);
}
