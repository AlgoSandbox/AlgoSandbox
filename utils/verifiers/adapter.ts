/* eslint-disable @typescript-eslint/no-explicit-any */
import { SandboxAdapter } from '@algo-sandbox/core';
import { z, ZodType } from 'zod';

import { sandboxParameters } from './parameters';
import { sandboxState } from './state';

export const sandboxAdapter = z.object({
  accepts: sandboxState,
  outputs: sandboxState,
  transform: z.function(z.tuple([sandboxState]), sandboxState),
}) satisfies ZodType<SandboxAdapter<any, any>>;

export const sandboxParameterizedAdapter = z.object({
  name: z.string(),
  parameters: sandboxParameters,
  create: z.function().args(z.object({}).optional()).returns(sandboxAdapter),
});
