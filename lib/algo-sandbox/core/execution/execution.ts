import _ from 'lodash';
import { isBoolean } from 'lodash';

import { SandboxAlgorithm } from '..';
import { SandboxState, SandboxStateType } from '../state';

export type SandboxExecutionStep<N extends SandboxStateType> = {
  startLine: number;
  endLine: number;
  tooltip: string | undefined;
  state: SandboxState<N>;
};

export type SandboxExecutionState<N extends SandboxStateType> = {
  clone(): SandboxExecutionState<N>;
  data: SandboxState<N>;
};

export type SandboxExecutionTrace<N extends SandboxStateType> = Array<
  SandboxExecutionStep<N>
>;

function deepClone<T>(data: T): T {
  return _.cloneDeep(data);
}

class SandboxStateImpl<N extends SandboxStateType>
  implements SandboxExecutionState<N>
{
  data: SandboxState<N>;

  constructor(data: SandboxState<N>) {
    this.data = data;
  }

  clone() {
    return new SandboxStateImpl(deepClone(this.data));
  }
}

export class SandboxAlgorithmExecutor<
  N extends SandboxStateType,
  M extends SandboxStateType,
> {
  executionTrace: SandboxExecutionTrace<M>;
  algorithm: SandboxAlgorithm<N, M>;
  algorithmInput: SandboxState<N>;
  isFullyExecuted: boolean;
  executionGenerator: Generator<SandboxExecutionStep<M>, boolean, void>;

  constructor(
    algorithm: SandboxAlgorithm<N, M>,
    algorithmInput: SandboxState<N>,
  ) {
    this.algorithm = algorithm;
    this.algorithmInput = algorithmInput;
    this.executionTrace = [];
    this.isFullyExecuted = false;

    const initialData = algorithm.createInitialState(algorithmInput);
    const state = new SandboxStateImpl<M>(initialData);

    // Either line(start, end, tooltip) or line(start, tooltip)
    const line = (
      start: number,
      endOrTooltip?: number | string,
      tooltip?: string,
    ) => {
      const end = typeof endOrTooltip === 'number' ? endOrTooltip : start;
      const _tooltip =
        typeof endOrTooltip === 'string' ? endOrTooltip : tooltip;

      // Sets the pseudocode to the current line
      return this.makeExecutionStep(start, end, _tooltip, state);
    };

    const initialAlgorithmState = {
      state: state.data,
      problemState: this.algorithmInput,
      line,
    };
    const runAlgorithm = this.algorithm.runAlgorithm;

    this.executionGenerator = runAlgorithm(initialAlgorithmState);
  }

  /**
   * Executes until a certain count or until the maximum execution step count is reached.
   * @param untilCount The count to execute until.
   * @param maxExecutionStepCount The maximum number of execution steps to execute within an execution attempt.
   * @returns Whether the max execution step count was reached.
   */
  *execute({
    untilCount,
    maxExecutionStepCount,
    updateCount,
  }: {
    untilCount?: number;
    maxExecutionStepCount: number;
    updateCount: number;
  }): Generator<void, boolean> {
    const previousExecutedCount = this.executionTrace.length;
    let generatedCount = 0;
    while (!this.isFullyExecuted) {
      if (generatedCount > 0 && generatedCount % updateCount === 0) {
        generatedCount = 0;
        yield;
      }

      if (
        untilCount !== undefined &&
        this.executionTrace.length >= untilCount
      ) {
        break;
      }

      if (untilCount === undefined) {
        const executedCount =
          this.executionTrace.length - previousExecutedCount;
        if (executedCount >= maxExecutionStepCount) {
          return true;
        }
      }

      const { done, value: executionStep } = this.executionGenerator.next();

      if (!isBoolean(executionStep)) {
        this.executionTrace.push(executionStep);
        generatedCount++;
      }
      if (done) {
        this.isFullyExecuted = true;
        break;
      }
    }

    return false;
  }

  makeExecutionStep(
    startLine: number,
    endLine: number,
    tooltip: string | undefined,
    state: SandboxExecutionState<M>,
  ): SandboxExecutionStep<M> {
    return {
      startLine,
      endLine,
      tooltip,
      state: state.clone().data,
    };
  }
}
