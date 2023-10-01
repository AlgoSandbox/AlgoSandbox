import { SandboxContext } from './context';
import { SandboxExecutionStep } from './execution';

export type SandboxAlgorithm<T, U> = {
  pseudocode: string;
  getInitialState: (problem: Readonly<T>) => U;
  runAlgorithm(
    context: SandboxContext<U>
  ): Generator<SandboxExecutionStep<U>, boolean, void>;
};
