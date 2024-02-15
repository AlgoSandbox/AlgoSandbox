import {
  createState,
  SandboxEnvironment,
  SandboxStateType,
} from '@algo-sandbox/core';
import { z, ZodType } from 'zod';

export const sandboxEnvironmentState = createState(
  'Environment',
  z.object({
    getInitialState: z.function().returns(z.record(z.any())),
    getStateKey: z
      .function()
      .args(z.record(z.any()))
      .returns(z.union([z.string(), z.symbol(), z.number()])),
    step: z.function(z.tuple([z.unknown(), z.string()])).returns(
      z.object({
        nextState: z.record(z.any()),
        reward: z.number(),
        terminated: z.boolean(),
        truncated: z.boolean(),
        info: z.record(z.unknown()),
      }),
    ),
    actions: z.function().args(z.record(z.any())).returns(z.array(z.string())),
    render: z.function().args(z.record(z.any())).returns(z.any()),
  }) satisfies ZodType<
    ReturnType<SandboxEnvironment<SandboxStateType, string>['getInitialState']>
  >,
);
