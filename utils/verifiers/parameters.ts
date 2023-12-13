import {
  SandboxParameter,
  SandboxParameters,
  SandboxParameterType,
  SandboxParameterTypeMap,
} from '@algo-sandbox/core';
import { assert, Equals, Extends } from 'tsafe';
import { z } from 'zod';

export const sandboxParameterType = z.union([
  z.literal('callback'),
  z.literal('color'),
  z.literal('float'),
  z.literal('integer'),
  z.literal('string'),
]);
type InferredSandboxParameterType = z.infer<typeof sandboxParameterType>;
assert<Equals<InferredSandboxParameterType, SandboxParameterType>>();

export const sandboxParameterValue = z.union([
  z.number(),
  z.string(),
  z.function(),
]);
type InferredSandboxParameterValue = z.infer<typeof sandboxParameterValue>;
assert<
  Extends<
    InferredSandboxParameterValue,
    SandboxParameterTypeMap[SandboxParameterType]
  >
>();

export const sandboxParameter = z.object({
  name: z.string(),
  type: sandboxParameterType,
  defaultValue: sandboxParameterValue,
  validate: z
    .function(
      z.tuple([sandboxParameterValue]),
      z.union([z.boolean(), z.string()]),
    )
    .optional(),
});
type InferredSandboxParameter = z.infer<typeof sandboxParameter>;
assert<
  Extends<SandboxParameter<SandboxParameterType>, InferredSandboxParameter>
>();

export const sandboxParameters = z.record(sandboxParameter);
type InferredSandboxParameters = z.infer<typeof sandboxParameters>;
assert<Extends<InferredSandboxParameters, SandboxParameters>>();
