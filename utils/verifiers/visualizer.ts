import { z } from 'zod';

import { sandboxParameters } from './parameters';
import { sandboxState } from './state';

export const sandboxVisualizer = z.object({
  name: z.string(),
  accepts: sandboxState,
  visualize: z.function(z.tuple([sandboxState]), z.any()),
});

export const sandboxParameterizedVisualizer = z.object({
  name: z.string(),
  parameters: sandboxParameters,
  create: z.function(z.tuple([z.object({})]), z.any()),
});

export const sandboxAnyVisualizer = z.union([
  sandboxVisualizer,
  sandboxParameterizedVisualizer,
]);
