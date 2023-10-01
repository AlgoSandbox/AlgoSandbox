import { SandboxExecutionStep } from './execution';

export type SandboxContext<T> = {
  state: T;
  line: SandboxLineFunction<T>;
};

type SandboxLineFunction<T> = (
  start: number,
  end?: number
) => SandboxExecutionStep<T>;
