import { SandboxAlgorithm } from '@algo-sandbox/core';
import { counterState } from '@algo-sandbox/states';

const exampleAlgorithm: SandboxAlgorithm<
  typeof counterState,
  typeof counterState
> = {
  name: 'Example algorithm',
  accepts: counterState,
  outputs: counterState,
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
