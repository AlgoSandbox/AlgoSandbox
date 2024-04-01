import { createState } from '@algo-sandbox/core';
import { z } from 'zod';

export const sortingAlgorithmInputState = createState(
  'Sorting algorithm input state',
  z.object({
    array: z.array(z.number()),
  }),
);

export const sortingState = z.enum([
  'unsorted',
  'sorted',
  'current',
  'comparing',
]);

export const sortingAlgorithmState = createState(
  'Sorting algorithm state',
  z.object({
    array: z.array(z.number()),
    states: z.array(sortingState),
  }),
);
