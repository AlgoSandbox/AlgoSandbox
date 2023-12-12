import { z } from 'zod';

export const counterState = z.object({
  counter: z.number(),
});
