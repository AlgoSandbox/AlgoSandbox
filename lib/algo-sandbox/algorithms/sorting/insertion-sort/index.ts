import { createAlgorithm, createState } from '@algo-sandbox/core';
import {
  sortingAlgorithmInputState,
  sortingAlgorithmState,
} from '@algo-sandbox/states';
import { z } from 'zod';

const pseudocode = `for each element (except the first) in the array:
  current = element
  j = index of the element before the current position
  while j >= 0 and current < element at j:
    shift element at j to j + 1 (make space)
    j--
  insert current at j + 1 (correct position)
done
`;

const insertionSortOutputState = createState(
  'Insertion sort output state',
  sortingAlgorithmState.shape.extend({
    current: z.number().optional(),
  }),
);

const insertionSort = createAlgorithm({
  name: 'Insertion sort',
  accepts: sortingAlgorithmInputState,
  outputs: insertionSortOutputState,
  pseudocode,
  createInitialState: ({ array }) => {
    return {
      array,
      states: array.map(() => 'unsorted' as const),
      current: undefined,
    };
  },
  *runAlgorithm({ line, state }) {
    for (let i = 1; i < state.array.length; i++) {
      state.current = state.array[i];
      state.states[0] = 'sorted';
      state.states[i] = 'current';

      yield line(2, `To insert: ${state.current}`);

      let j = i - 1;
      while (j >= 0 && state.current < state.array[j]) {
        state.states[j] = 'comparing';
        yield line(3, `Shift ${state.array[j]} to the right`);

        // Swap elements
        state.array[j + 1] = state.array[j];
        state.array[j] = state.current;
        state.states[j + 1] = 'comparing';
        state.states[j] = 'current';

        yield line(3);
        state.states[j + 1] = 'sorted';

        j--;
      }

      // Insert current element at the correct position
      state.array[j + 1] = state.current;
      yield line(7, `Insert ${state.current} at index ${j + 1}`);
      state.states[j + 1] = 'sorted';
      yield line(7);
    }

    state.states[state.array.length - 1] = 'sorted';
    yield line(8, 'Array is sorted');
    return true;
  },
});

export default insertionSort;
