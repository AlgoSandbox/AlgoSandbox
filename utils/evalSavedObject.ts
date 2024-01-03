import {
  DbObjectSaved,
  Value,
} from '@components/box-page/box-context/sandbox-object';

import { DbSandboxObjectType } from './db';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export type DbObjectEvaluation<T extends DbSandboxObjectType> = {
  objectEvaled: Value<T> | null;
  errorMessage: string | null;
};

export function evalSavedObject<T extends DbSandboxObjectType>(
  object: DbObjectSaved<T> | null,
) {
  if (object === null) {
    return { objectEvaled: null, errorMessage: null };
  }

  try {
    return {
      objectEvaled: evalWithAlgoSandbox(object.files['index.ts']) as Value<T>,
      errorMessage: null,
    };
  } catch (e) {
    console.error(e);
    return {
      objectEvaled: null,
      errorMessage: `Error during component code evaluation.\nYou may have a syntax error.\n\n${e}`,
    };
  }
}
