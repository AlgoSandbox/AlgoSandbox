import _ from 'lodash';
import { isBoolean } from 'lodash';

import { SandboxAlgorithm } from '../algorithm/algorithm';
import { SandboxProblem } from '../problem/problem';
import { SandboxState, SandboxStateName } from '../state';

export type SandboxExecutionStep<N extends SandboxStateName> = {
  startLine: number;
  endLine: number;
  state: SandboxState<N>;
};

export type SandboxExecutionState<N extends SandboxStateName> = {
  clone(): SandboxExecutionState<N>;
  data: SandboxState<N>;
};

export type SandboxExecutionTrace<N extends SandboxStateName> = Array<
  SandboxExecutionStep<N>
>;

function deepClone<T>(data: T): T {
  return _.cloneDeep(data);
}

class SandboxStateImpl<N extends SandboxStateName>
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
  N extends SandboxStateName,
  M extends SandboxStateName
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

    const initialData = algorithm.createInitialState(this.problem.initialState);
    const state = new SandboxStateImpl<M>(initialData);

    const line = (start: number, end?: number) => {
      // Sets the pseudocode to the current line
      return this.makeExecutionStep(start, end ?? start, state);
    };

    this.executionGenerator = this.algorithm.runAlgorithm({
      state: state.data,
      line,
    });
    this.execute(1);
  }

  execute(untilCount?: number) {
    while (
      !this.isFullyExecuted &&
      (untilCount === undefined || this.executionTrace.length < untilCount)
    ) {
      const { done, value: executionStep } = this.executionGenerator.next();
      if (done) {
        this.isFullyExecuted = true;
        break;
      }

      if (!isBoolean(executionStep)) {
        this.executionTrace.push(executionStep);
      }
    }
  }

  makeExecutionStep(
    startLine: number,
    endLine: number,
    state: SandboxExecutionState<M>
  ) {
    return {
      startLine,
      endLine,
      state: state.clone().data,
    };
  }
}
