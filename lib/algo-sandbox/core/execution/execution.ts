import _ from 'lodash';
import { isBoolean } from 'lodash';
import { SandboxAlgorithm } from '../algorithm/algorithm';
import { SandboxProblem } from '../problem/problem';

export type SandboxExecutionStep<T> = {
  startLine: number;
  endLine: number;
  state: T;
};

export type SandboxState<T> = {
  clone(): SandboxState<T>;
  data: T;
};

export type SandboxExecutionTrace<T> = Array<SandboxExecutionStep<T>>;

function deepClone<T>(data: T): T {
  return _.cloneDeep(data);
}

class SandboxStateImpl<T> implements SandboxState<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }

  clone() {
    return new SandboxStateImpl(deepClone(this.data));
  }
}

export type SandboxScene<T, U> = {
  copyWithExecution: (untilCount?: number) => SandboxScene<T, U>;
  executionTrace: Readonly<SandboxExecutionTrace<U>>;
  algorithm: Readonly<SandboxAlgorithm<T, U>>;
  problem: Readonly<SandboxProblem<T>>;
  isFullyExecuted: boolean;
};

class SandboxAlgorithmExecutor<T, U> {
  executionTrace: SandboxExecutionTrace<U>;
  algorithm: SandboxAlgorithm<T, U>;
  problem: SandboxProblem<T>;
  isFullyExecuted: boolean;
  executionGenerator: Generator<SandboxExecutionStep<U>, boolean, void>;

  constructor(algorithm: SandboxAlgorithm<T, U>, problem: SandboxProblem<T>) {
    this.algorithm = algorithm;
    this.problem = problem;
    this.executionTrace = [];
    this.isFullyExecuted = false;

    const initialData = algorithm.getInitialState(this.problem.initialState);
    const state = new SandboxStateImpl<U>(initialData);

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
    state: SandboxState<U>
  ) {
    return {
      startLine,
      endLine,
      state: state.clone().data,
    };
  }
}

export function createScene<T, U>({
  algorithm,
  problem,
}: {
  algorithm: SandboxAlgorithm<T, U>;
  problem: SandboxProblem<T>;
}): SandboxScene<T, U> {
  const executor = new SandboxAlgorithmExecutor(algorithm, problem);

  const createSceneInternal = (): SandboxScene<T, U> => {
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
