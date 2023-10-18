import { SandboxAlgorithm } from '@algo-sandbox/core';

type ExampleState = {
  counter: number;
};

declare module '@algo-sandbox/core' {
  export interface SandboxStateNameMap {
    counter: ExampleState;
  }
}

const exampleAlgorithm: SandboxAlgorithm<'counter', 'counter'> = {
  name: 'Example algorithm',
  accepts: 'counter',
  outputs: 'counter',
  pseudocode: 'set counter to 0\nwhile counter < 10:\n  increment counter\nend',
  createInitialState: (problem) => ({ ...problem }),
  *runAlgorithm({ line, state }) {
    yield line(1);
    while (true) {
      yield line(2);
      if (state.counter >= 10) {
        break;
      }
      state.counter += 1;
      yield line(3);
    }
    yield line(4);
    return true;
  },
};

export default exampleAlgorithm;
