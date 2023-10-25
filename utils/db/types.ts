export type DbSandboxObject = {
  key?: string;
  name: string;
  typescriptCode: string;
};

export type DbSandboxObjectSaved = DbSandboxObject & {
  key: string;
};

export type DbAlgorithm = DbSandboxObject;
export type DbAlgorithmSaved = DbSandboxObjectSaved;
export type DbProblem = DbSandboxObject;
export type DbProblemSaved = DbSandboxObjectSaved;
export type DbVisualizer = DbSandboxObject;
export type DbVisualizerSaved = DbSandboxObjectSaved;
