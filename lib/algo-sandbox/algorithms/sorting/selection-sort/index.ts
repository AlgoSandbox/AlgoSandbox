import { createAlgorithm, createState } from '@algo-sandbox/core';
import {
  sortingAlgorithmInputState,
  sortingAlgorithmState,
} from '@algo-sandbox/states';
import { z } from 'zod';

const pseudocode = `do (numOfElements-1) times:
  min = first unsorted element
  for each element in unsorted elements
    if element < currentMinimum
      min = element
  swap minimum with first unsorted position
`;

const selectionSortOutputState = createState(
  'Selection sort output state',
  sortingAlgorithmState.shape.extend({
    minIndex: z.number().optional(),
  }),
);

const selectionSort = createAlgorithm({
  name: 'Selection sort',
  accepts: sortingAlgorithmInputState,
  outputs: selectionSortOutputState,
  pseudocode,
  createInitialState: ({ array }) => {
    return {
      array,
      states: array.map(() => 'unsorted' as const),
      minIndex: undefined,
    };
  },
  *runAlgorithm({ line, state }) {
    yield line(2, `Set min = ${state.array[0]}`);

    for (let i = 0; i < state.array.length - 1; i++) {
      state.minIndex = i;
      state.states[i] = 'current';

      for (let j = i + 1; j < state.array.length; j++) {
        state.states[j] = 'comparing';

        yield line(
          4,
          `Comparing min = ${state.array[state.minIndex]} with ${
            state.array[j]
          }`,
        );

        if (state.array[j] < state.array[state.minIndex]) {
          const currMin = state.array[state.minIndex];
          state.states[state.minIndex] = 'unsorted';
          state.minIndex = j;
          state.states[j] = 'current';
          const newMin = state.array[j];
          yield line(5, `${newMin} < ${currMin}; set new minimum = ${newMin}`);
        } else {
          state.states[j] = 'unsorted';
        }
      }

      // Swap minimum element with current element
      if (state.minIndex !== i) {
        const temp = state.array[i];
        state.array[i] = state.array[state.minIndex];
        state.array[state.minIndex] = temp;

        yield line(
          6,
          `Swap ${state.array[i]} and ${state.array[state.minIndex]}`,
        );
        state.states[i] = 'sorted';
      } else {
        state.states[i] = 'sorted';
      }
    }

    state.states[state.array.length - 1] = 'sorted';
    yield line(7, 'Array is sorted');
    return true;
  },
});

export default selectionSort;
