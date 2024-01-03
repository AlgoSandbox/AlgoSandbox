import { SandboxAdapter } from '@algo-sandbox/core/adapter';
import { counterState, graphSearchAlgorithmState } from '@algo-sandbox/states';

const searchGraphStateToCounterAdapter: SandboxAdapter<
  typeof graphSearchAlgorithmState,
  typeof counterState
> = {
  accepts: graphSearchAlgorithmState,
  outputs: counterState,
  transform: (value) => {
    return {
      counter: value.visited.size,
    };
  },
};

export default searchGraphStateToCounterAdapter;
