import { SandboxState, SandboxStateType } from '../state';
import { SandboxExecutionStep } from '.';

export type SandboxExecutionContext<N extends SandboxStateType> = {
  state: SandboxState<N>;
  line: SandboxLineFunction<N>;
};

type SandboxLineFunction<N extends SandboxStateType> = (
  start: number,
  end?: number,
) => SandboxExecutionStep<N>;
