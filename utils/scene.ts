import {
  SandboxAlgorithm,
  SandboxAlgorithmExecutor,
  SandboxExecutionTrace,
  SandboxState,
  SandboxStateType,
} from '@algo-sandbox/core';

export type ReadonlySandboxScene<M extends SandboxStateType> = {
  executionTrace: Readonly<SandboxExecutionTrace<M>>;
  isFullyExecuted: boolean;
  didReachExecutionLimit: boolean;
};

export type SandboxScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
> = ReadonlySandboxScene<M> & {
  copyWithExecution: (untilCount?: number) => SandboxScene<N, M>;
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
