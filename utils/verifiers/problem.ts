import { z } from 'zod';

import { sandboxParameters } from './parameters';
import { sandboxState } from './state';

export const sandboxProblem = z.object({
  name: z.string(),
  type: sandboxState,
  initialState: z.object({}),
});

export const sandboxParameterizedProblem = z.object({
  name: z.string(),
  parameters: sandboxParameters,
  create: z.function(z.tuple([z.object({})]), z.any()),
});

export const sandboxAnyProblem = z.union([
  sandboxProblem,
  sandboxParameterizedProblem,
]);
