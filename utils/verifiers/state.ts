import { SandboxState } from '@algo-sandbox/core';
import { z, ZodType } from 'zod';

export const sandboxState = z.object({
  name: z.string(),
  shape: z.instanceof(z.ZodType),
}) satisfies ZodType<SandboxState>;
