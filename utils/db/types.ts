export type DbSandboxObject = {
  key?: string;
  name: string;
  typescriptCode: string;
};

export type DbSavedSandboxObject = DbSandboxObject & {
  key: string;
};

export type DbSavedAlgorithm = DbSavedSandboxObject;
