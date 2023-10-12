import {
  SandboxAlgorithm,
  SandboxAlgorithmExecutor,
  SandboxExecutionTrace,
  SandboxProblem,
  SandboxStateName,
} from '@/lib/algo-sandbox/core';

export type SandboxScene<
  N extends SandboxStateName,
  M extends SandboxStateName
> = {
  copyWithExecution: (untilCount?: number) => SandboxScene<N, M>;
  executionTrace: Readonly<SandboxExecutionTrace<M>>;
  algorithm: Readonly<SandboxAlgorithm<N, M>>;
  problem: Readonly<SandboxProblem<N>>;
  isFullyExecuted: boolean;
};

export function createScene<
  N extends SandboxStateName,
  M extends SandboxStateName
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
