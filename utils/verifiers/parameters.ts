import {
  SandboxParameter,
  SandboxParameters,
  SandboxParameterType,
  SandboxParameterTypeMap,
} from '@algo-sandbox/core';
import { z } from 'zod';

export const sandboxParameterType = z.union([
  z.literal('arrayNumber'),
  z.literal('callback'),
  z.literal('color'),
  z.literal('code'),
  z.literal('float'),
  z.literal('integer'),
  z.literal('string'),
  z.literal('graph'),
  z.literal('grid'),
  z.literal('spreadsheet'),
]) satisfies z.ZodType<SandboxParameterType>;

export type AssertEqual<T, Expected> = [T] extends [Expected]
  ? [Expected] extends [T]
    ? true
    : false
  : false;

export const assertType = <T, Expected>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ..._: AssertEqual<T, Expected> extends true ? [] : ['invalid type']
) => {
  // noop
};

assertType<SandboxParameterType, z.infer<typeof sandboxParameterType>>();

export const sandboxParameterValue = z.union([
  z.number(),
  z.string(),
  z.array(z.any()),
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
