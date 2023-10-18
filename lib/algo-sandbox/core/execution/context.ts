import { SandboxState, SandboxStateName } from '../state';
import { SandboxExecutionStep } from '.';

export type SandboxExecutionContext<N extends SandboxStateName> = {
  state: SandboxState<N>;
  line: SandboxLineFunction<N>;
};

type SandboxLineFunction<N extends SandboxStateName> = (
  start: number,
  end?: number
) => SandboxExecutionStep<N>;
