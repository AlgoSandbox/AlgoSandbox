import { SandboxExecutionStep } from '.';
import { SandboxState, SandboxStateName } from '../state';

export type SandboxExecutionContext<N extends SandboxStateName> = {
  state: SandboxState<N>;
  line: SandboxLineFunction<N>;
};

type SandboxLineFunction<N extends SandboxStateName> = (
  start: number,
  end?: number
) => SandboxExecutionStep<N>;
