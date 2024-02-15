import { SandboxState, SandboxStateType } from '../state';
import { SandboxExecutionStep } from '.';

export type SandboxExecutionContext<
  N extends SandboxStateType,
  M extends SandboxStateType,
> = {
  problemState: Readonly<SandboxState<N>>;
  state: SandboxState<M>;
  line: SandboxLineFunction<M>;
};

type SandboxLineFunction<N extends SandboxStateType> = (
  start: number,
  end?: number,
) => SandboxExecutionStep<N>;
