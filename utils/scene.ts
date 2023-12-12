import {
  SandboxAlgorithm,
  SandboxAlgorithmExecutor,
  SandboxExecutionTrace,
  SandboxProblem,
  SandboxStateType,
} from '@algo-sandbox/core';

export type SandboxScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
> = {
  copyWithExecution: (untilCount?: number) => SandboxScene<N, M>;
  executionTrace: Readonly<SandboxExecutionTrace<M>>;
  algorithm: Readonly<SandboxAlgorithm<N, M>>;
  problem: Readonly<SandboxProblem<N>>;
  isFullyExecuted: boolean;
};

export function createScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
>({
  algorithm,
  problem,
}: {
  algorithm: SandboxAlgorithm<N, M>;
  problem: SandboxProblem<N>;
}): SandboxScene<N, M> {
  const executor = new SandboxAlgorithmExecutor(algorithm, problem);

  const createSceneInternal = (): SandboxScene<N, M> => {
    return {
      algorithm: algorithm,
      problem: problem,
      isFullyExecuted: executor.isFullyExecuted,
      executionTrace: [...executor.executionTrace],
      copyWithExecution: (untilCount) => {
        executor.execute(untilCount);
        return createSceneInternal();
      },
    };
  };

  return createSceneInternal();
}
