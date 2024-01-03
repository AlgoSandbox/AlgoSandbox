import {
  DbSandboxObject,
  DbSandboxObjectSaved,
  DbSandboxObjectType,
} from '@utils/db';

export type BoxContextCustomObjects<T extends DbSandboxObjectType> = {
  selected: DbSandboxObjectSaved | null;
  add: (value: DbSandboxObject<T>) => void;
  set: (value: DbSandboxObjectSaved<T>) => void;
  remove: (value: DbSandboxObjectSaved<T>) => void;
};

export const defaultBoxContextCustomObjects: BoxContextCustomObjects<DbSandboxObjectType> =
  {
    selected: null,
    add: () => {},
    set: () => {},
    remove: () => {},
  };
