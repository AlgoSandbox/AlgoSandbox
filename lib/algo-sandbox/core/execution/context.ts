import { SandboxExecutionStep } from './execution';

export type SandboxExecutionContext<T> = {
  state: T;
  line: SandboxLineFunction<T>;
};

type SandboxLineFunction<T> = (
  start: number,
  end?: number
) => SandboxExecutionStep<T>;
