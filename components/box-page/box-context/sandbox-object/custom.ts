import { DbSandboxObject, DbSandboxObjectSaved } from '@utils/db';

export type BoxContextCustomObjects = {
  selected: DbSandboxObjectSaved | null;
  add: (value: DbSandboxObject) => void;
  set: (value: DbSandboxObjectSaved) => void;
  remove: (value: DbSandboxObjectSaved) => void;
};

export const defaultBoxContextCustomObjects: BoxContextCustomObjects = {
  selected: null,
  add: () => {},
  set: () => {},
  remove: () => {},
};
