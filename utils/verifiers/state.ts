import { z } from 'zod';

export const sandboxState = z.object({
  name: z.string(),
  shape: z.instanceof(z.ZodType),
});
