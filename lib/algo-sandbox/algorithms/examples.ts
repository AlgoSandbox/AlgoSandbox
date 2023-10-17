import {
  SandboxAlgorithm,
  createParameteredAlgorithm,
  SandboxParam,
} from '@algo-sandbox/core';

type ExampleState = {
  counter: number;
};

declare module '@algo-sandbox/core' {
  export interface SandboxStateNameMap {
    counter: ExampleState;
  }
}

export const exampleAlgorithm: SandboxAlgorithm<'counter', 'counter'> = {
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

export const exampleParameteredAlgorithm = createParameteredAlgorithm({
  name: 'Increment counter',
  accepts: 'counter',
  outputs: 'counter',
  parameters: {
    increment: SandboxParam.integer('Increment value', 1),
    counterLimit: SandboxParam.integer('Counter limit', 10),
  },
  createInitialState: (problem) => ({ ...problem }),
  getPseudocode: ({ increment, counterLimit }) => {
    return `while counter < ${counterLimit}:\n  increment counter by ${increment}\nend`;
  },
  *runAlgorithm({ line, state, parameters: { increment, counterLimit } }) {
    while (true) {
      yield line(1);
      if (state.counter >= counterLimit) {
        break;
      }
      state.counter += increment;
      yield line(2);
    }
    yield line(3);
    return true;
  },
});

namespace Examples {
  export const incrementCounter = exampleParameteredAlgorithm;
}

export default Examples;
