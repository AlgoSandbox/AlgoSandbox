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
  copyWithExecution: (options: {
    untilCount?: number;
    maxExecutionStepCount: number;
    updateCount: number;
  }) => Generator<SandboxScene<N, M>, SandboxScene<N, M>>;
};

export function createScene<
  N extends SandboxStateType,
  M extends SandboxStateType,
>({
  algorithm,
  algorithmInput,
}: {
  algorithm: SandboxAlgorithm<N, M>;
  algorithmInput: SandboxState<N>;
}): SandboxScene<N, M> {
  const executor = new SandboxAlgorithmExecutor(algorithm, algorithmInput);

  const createSceneInternal = (
    didReachExecutionLimit: boolean,
  ): SandboxScene<N, M> => {
    return {
      isFullyExecuted: executor.isFullyExecuted,
      didReachExecutionLimit,
      executionTrace: [...executor.executionTrace],
      *copyWithExecution({ untilCount, maxExecutionStepCount, updateCount }) {
        const stepGenerator = executor.execute({
          untilCount,
          maxExecutionStepCount,
          updateCount,
        });

        let value = stepGenerator.next();

        while (!value.done) {
          yield createSceneInternal(false);
          value = stepGenerator.next();
        }

        const didReachExecutionLimit = value.value;
        return createSceneInternal(didReachExecutionLimit);
      },
    };
  };

  return createSceneInternal(false);
}
