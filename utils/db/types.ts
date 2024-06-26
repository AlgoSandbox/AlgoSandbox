import { z } from 'zod';

export const sandboxObjectType = z.enum([
  'algorithm',
  'box',
  'problem',
  'visualizer',
  'adapter',
]);

export type DbSandboxObjectType = z.infer<typeof sandboxObjectType>;

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
};

export type DbAdapter = DbSandboxObject<'adapter'>;
export type DbAdapterSaved = DbSandboxObjectSaved<'adapter'>;
export type DbAlgorithm = DbSandboxObject<'algorithm'>;
export type DbAlgorithmSaved = DbSandboxObjectSaved<'algorithm'>;
export type DbProblem = DbSandboxObject<'problem'>;
export type DbProblemSaved = DbSandboxObjectSaved<'problem'>;
export type DbVisualizer = DbSandboxObject<'visualizer'>;
export type DbVisualizerSaved = DbSandboxObjectSaved<'visualizer'>;
export type DbBox = DbSandboxObject<'box'>;
export type DbBoxSaved = DbSandboxObjectSaved<'box'>;
