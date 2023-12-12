import { SandboxExecutionContext } from '../execution/context';
import { SandboxExecutionStep } from '../execution/execution';
import { SandboxState, SandboxStateType } from '../state';

export type SandboxAlgorithm<
  N extends SandboxStateType,
  M extends SandboxStateType,
> = {
  name: string;
  accepts: N;
  outputs: M;
  pseudocode: string;
  createInitialState: (problem: Readonly<SandboxState<N>>) => SandboxState<M>;
  runAlgorithm(
    context: SandboxExecutionContext<M>
  ): Generator<SandboxExecutionStep<M>, boolean, void>;
};
