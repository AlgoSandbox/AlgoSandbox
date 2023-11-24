import { createState } from '@algo-sandbox/core';
import { z } from 'zod';

export const counterState = createState(
  'Counter',
  z.object({
    counter: z.number(),
  }),
);
