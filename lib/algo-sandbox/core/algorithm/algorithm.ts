import { SandboxExecutionContext } from '../execution/context';
import { SandboxExecutionStep } from '../execution/execution';

export type SandboxAlgorithm<T, U> = {
  name: string;
  pseudocode: string;
  getInitialState: (problem: Readonly<T>) => U;
  runAlgorithm(
    context: SandboxExecutionContext<U>
  ): Generator<SandboxExecutionStep<U>, boolean, void>;
};
