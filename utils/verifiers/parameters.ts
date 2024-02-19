import {
  SandboxParameter,
  SandboxParameters,
  SandboxParameterType,
  SandboxParameterTypeMap,
} from '@algo-sandbox/core';
import { z } from 'zod';

export const sandboxParameterType = z.union([
  z.literal('callback'),
  z.literal('color'),
  z.literal('float'),
  z.literal('integer'),
  z.literal('string'),
]) satisfies z.ZodType<SandboxParameterType>;

export const sandboxParameterValue = z.union([
  z.number(),
  z.string(),
  z.function(),
]) satisfies z.ZodType<SandboxParameterTypeMap[SandboxParameterType]>;

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
}) satisfies z.ZodType<SandboxParameter<SandboxParameterType>>;

export const sandboxParameters = z.record(
  sandboxParameter,
) satisfies z.ZodType<SandboxParameters>;
