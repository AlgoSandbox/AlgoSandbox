/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SandboxParameterizedProblem,
  SandboxProblem,
} from '@algo-sandbox/core';
import { z, ZodType } from 'zod';

import { sandboxParameters } from './parameters';
import { sandboxState } from './state';

export const sandboxProblem = z.object({
  name: z.string(),
  type: sandboxState,
  getInitialState: z.function().returns(z.any()),
}) satisfies ZodType<SandboxProblem<any>>;

export const sandboxParameterizedProblem = z.object({
  name: z.string(),
  parameters: sandboxParameters,
  create: z.function().args(z.object({}).optional()).returns(sandboxProblem),
}) satisfies ZodType<SandboxParameterizedProblem<any, any>>;

export const sandboxAnyProblem = z.union([
  sandboxProblem,
  sandboxParameterizedProblem,
]);
