import {
  SandboxAlgorithm,
  SandboxAlgorithmExecutor,
  SandboxExecutionTrace,
  SandboxState,
  SandboxStateType,
} from '@algo-sandbox/core';

export type SandboxScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
> = {
  copyWithExecution: (untilCount?: number) => SandboxScene<N, M>;
  executionTrace: Readonly<SandboxExecutionTrace<M>>;
  algorithm: Readonly<SandboxAlgorithm<N, M>>;
  algorithmInput: Readonly<SandboxState<N>>;
  isFullyExecuted: boolean;
  didReachExecutionLimit: boolean;
};

export function createScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
>({
  algorithm,
  algorithmInput,
  maxExecutionStepCount,
}: {
  algorithm: SandboxAlgorithm<N, M>;
  algorithmInput: SandboxState<N>;
  maxExecutionStepCount: number;
}): SandboxScene<N, M> {
  const executor = new SandboxAlgorithmExecutor(algorithm, algorithmInput);

  const createSceneInternal = (
    didReachExecutionLimit: boolean,
  ): SandboxScene<N, M> => {
    return {
      algorithm: algorithm,
      algorithmInput: algorithmInput,
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
