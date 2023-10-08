import { SandboxExecutionContext } from '../execution/context';
import { SandboxExecutionStep } from '../execution/execution';
import { SandboxState, SandboxStateName } from '../state';

export type SandboxAlgorithm<
  N extends SandboxStateName,
  M extends SandboxStateName
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
