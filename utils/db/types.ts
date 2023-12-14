export type DbSandboxObjectType = 'algorithm' | 'problem' | 'visualizer';

export type DbSandboxObject<
  T extends DbSandboxObjectType = DbSandboxObjectType,
> = {
  key?: string;
  name: string;
  files: Record<string, string>;
  editable: boolean;
  type: T;
};

export type DbSandboxObjectSaved<
  T extends DbSandboxObjectType = DbSandboxObjectType,
> = DbSandboxObject<T> & {
  key: string;
  writeup?: string;
};

export type DbAlgorithm = DbSandboxObject<'algorithm'>;
export type DbAlgorithmSaved = DbSandboxObjectSaved<'algorithm'>;
export type DbProblem = DbSandboxObject<'problem'>;
export type DbProblemSaved = DbSandboxObjectSaved<'problem'>;
export type DbVisualizer = DbSandboxObject<'visualizer'>;
export type DbVisualizerSaved = DbSandboxObjectSaved<'visualizer'>;
