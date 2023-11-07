import { createParameterizedAlgorithm, SandboxParam } from '@algo-sandbox/core';

type ExampleState = {
  counter: number;
};

declare module '@algo-sandbox/core' {
  export interface SandboxStateNameMap {
    counter: ExampleState;
  }
}

const counterParameterized = createParameterizedAlgorithm({
  name: 'Increment counter',
  accepts: 'counter',
  outputs: 'counter',
  parameters: {
    increment: SandboxParam.integer(
      'Increment value',
      1,
      (value) => value !== 0 || 'Value cannot be 0'
    ),
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

export default counterParameterized;
