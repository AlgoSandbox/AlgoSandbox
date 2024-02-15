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
  didReachExecutionLimit: boolean;
};

export function createScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
>({
  algorithm,
  problem,
  maxExecutionStepCount,
}: {
  algorithm: SandboxAlgorithm<N, M>;
  problem: SandboxProblem<N>;
  maxExecutionStepCount: number;
}): SandboxScene<N, M> {
  const executor = new SandboxAlgorithmExecutor(algorithm, problem);

  const createSceneInternal = (
    didReachExecutionLimit: boolean,
  ): SandboxScene<N, M> => {
    return {
      algorithm: algorithm,
      problem: problem,
      isFullyExecuted: executor.isFullyExecuted,
      didReachExecutionLimit,
      executionTrace: [...executor.executionTrace],
      copyWithExecution: (untilCount) => {
        const didReachExecutionLimit = executor.execute({
          untilCount,
          maxExecutionStepCount,
        });
        return createSceneInternal(didReachExecutionLimit);
      },
    };
  };

  return createSceneInternal(false);
}
