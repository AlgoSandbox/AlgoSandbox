/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SandboxAlgorithm,
  SandboxParameterizedAlgorithm,
} from '@algo-sandbox/core';
import { z, ZodType } from 'zod';

import { sandboxParameters } from './parameters';
import { sandboxState } from './state';

export const sandboxAlgorithm = z.object({
  name: z.string(),
  accepts: sandboxState,
  outputs: sandboxState,
  pseudocode: z.string(),
  createInitialState: z.function().args(z.object({}).readonly()),
  runAlgorithm: z.function(z.tuple([z.any()]), z.any()),
}) satisfies ZodType<SandboxAlgorithm<any, any>>;

export const sandboxParameterizedAlgorithm = z.object({
  name: z.string(),
  parameters: sandboxParameters,
  create: z.function().args(z.object({}).optional()).returns(sandboxAlgorithm),
}) satisfies ZodType<SandboxParameterizedAlgorithm<any, any, any>>;

export const sandboxAnyAlgorithm = z.union([
  sandboxAlgorithm,
  sandboxParameterizedAlgorithm,
]);
