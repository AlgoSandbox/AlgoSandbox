import { createAlgorithm, createState } from '@algo-sandbox/core';
import {
  sortingAlgorithmInputState,
  sortingAlgorithmState,
} from '@algo-sandbox/states';
import { z } from 'zod';

const pseudocode = `do
  swapped = false
  for i = 1 to indexOfLastUnsortedElement - 1
    if leftElement > rightElement
      swap(leftElement, rightElement)
      swapped = true
while swapped
`;

const bubbleSortOutputState = createState(
  'Bubble sort output state',
  sortingAlgorithmState.shape.extend({
    swapped: z.boolean(),
  }),
);

const bubbleSort = createAlgorithm({
  name: 'Bubble sort',
  accepts: sortingAlgorithmInputState,
  outputs: bubbleSortOutputState,
  pseudocode,
  createInitialState: ({ array }) => {
    return {
      array,
      states: array.map(() => 'unsorted' as const),
      swapped: false,
    };
  },
  *runAlgorithm({ line, state }) {
    // Bubble sort
    yield line(2, 'Init with swapped = false');

    while (true) {
      state.swapped = false;

      for (let i = 0; i < state.array.length - 1; i++) {
        for (let j = 0; j < state.array.length; j++) {
          state.states[j] = 'unsorted';
        }

        state.states[i] = 'current';
        state.states[i + 1] = 'comparing';

        yield line(4, `Comparing ${state.array[i]} and ${state.array[i + 1]}`);

        if (state.array[i] > state.array[i + 1]) {
          const temp = state.array[i];
          state.array[i] = state.array[i + 1];
          state.array[i + 1] = temp;

          yield line(5, 6, `Swap ${state.array[i]} and ${state.array[i + 1]}`);

          state.swapped = true;
        }
      }

      if (!state.swapped) {
        for (let i = 0; i < state.array.length; i++) {
          state.states[i] = 'sorted';
        }
        yield line(7, `Swapped = ${state.swapped}, break the loop`);
        break;
      }

      yield line(7, `Swapped = ${state.swapped}, continue with next iteration`);
    }

    return true;
  },
});

export default bubbleSort;
