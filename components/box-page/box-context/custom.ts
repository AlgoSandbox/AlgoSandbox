import { DbSandboxObject, DbSavedSandboxObject } from '@utils/db';

export type BoxContextCustomObjects = {
  selected: DbSavedSandboxObject | null;
  add: (value: DbSandboxObject) => void;
  set: (value: DbSavedSandboxObject) => void;
  remove: (value: DbSavedSandboxObject) => void;
};

export const defaultBoxContextCustomObjects: BoxContextCustomObjects = {
  selected: null,
  add: () => {},
  set: () => {},
  remove: () => {},
};
