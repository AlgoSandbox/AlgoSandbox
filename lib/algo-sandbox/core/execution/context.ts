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

type SandboxLineFunction<N extends SandboxStateType> = ((
  start: number,
  end: number,
  tooltip?: string,
) => SandboxExecutionStep<N>) &
  ((start: number, tooltip?: string) => SandboxExecutionStep<N>);
