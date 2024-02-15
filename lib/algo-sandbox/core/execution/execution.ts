import _ from 'lodash';
import { isBoolean } from 'lodash';

import { SandboxAlgorithm } from '../algorithm/algorithm';
import { SandboxProblem } from '../problem/problem';
import { SandboxState, SandboxStateType } from '../state';

export type SandboxExecutionStep<N extends SandboxStateType> = {
  startLine: number;
  endLine: number;
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
  problem: SandboxProblem<N>;
  isFullyExecuted: boolean;
  executionGenerator: Generator<SandboxExecutionStep<M>, boolean, void>;

  constructor(algorithm: SandboxAlgorithm<N, M>, problem: SandboxProblem<N>) {
    this.algorithm = algorithm;
    this.problem = problem;
    this.executionTrace = [];
    this.isFullyExecuted = false;

    const problemState = problem.getInitialState();

    const initialData = algorithm.createInitialState(problemState);
    const state = new SandboxStateImpl<M>(initialData);

    const line = (start: number, end?: number) => {
      // Sets the pseudocode to the current line
      return this.makeExecutionStep(start, end ?? start, state);
    };

    this.executionGenerator = this.algorithm.runAlgorithm({
      state: state.data,
      problemState,
      line,
    });
  }

  /**
   * Executes until a certain count or until the maximum execution step count is reached.
   * @param untilCount The count to execute until.
   * @param maxExecutionStepCount The maximum number of execution steps to execute within an execution attempt.
   * @returns Whether the max execution step count was reached.
   */
  execute({
    untilCount,
    maxExecutionStepCount,
  }: {
    untilCount?: number;
    maxExecutionStepCount: number;
  }): boolean {
    const previousExecutedCount = this.executionTrace.length;
    while (!this.isFullyExecuted) {
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
      if (done) {
        this.isFullyExecuted = true;
        break;
      }

      if (!isBoolean(executionStep)) {
        this.executionTrace.push(executionStep);
      }
    }

    return false;
  }

  makeExecutionStep(
    startLine: number,
    endLine: number,
    state: SandboxExecutionState<M>,
  ) {
    return {
      startLine,
      endLine,
      state: state.clone().data,
    };
  }
}
