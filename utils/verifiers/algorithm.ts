import { z } from 'zod';

import { sandboxParameters } from './parameters';
import { sandboxState } from './state';

export const sandboxAlgorithm = z.object({
  name: z.string(),
  accepts: sandboxState,
  outputs: sandboxState,
  pseudocode: z.string(),
  createInitialState: z.function(z.tuple([sandboxState]), sandboxState),
  runAlgorithm: z.function(z.tuple([z.any()]), z.any()),
});

export const sandboxParameterizedAlgorithm = z.object({
  name: z.string(),
  parameters: sandboxParameters,
  create: z.function(z.tuple([z.object({})]), z.any()),
});

export const sandboxAnyAlgorithm = z.union([
  sandboxAlgorithm,
  sandboxParameterizedAlgorithm,
]);
