import {
  AdapterCompositionFlat,
  AdapterCompositionTree,
  SandboxBox,
} from '@algo-sandbox/core';
import { z } from 'zod';

type Required<T> = T extends undefined ? never : T;

const treeComposition = z.object({
  type: z.literal('tree'),
  connections: z.array(
    z.object({
      fromKey: z.string(),
      fromSlot: z.string(),
      toKey: z.string(),
      toSlot: z.string(),
    }),
  ),
}) satisfies z.ZodType<AdapterCompositionTree>;

const flatComposition = z.object({
  type: z.literal('flat'),
  order: z.array(z.string()),
}) satisfies z.ZodType<AdapterCompositionFlat>;

const config = z.object({
  adapters: z.record(z.string()),
  composition: z.union([treeComposition, flatComposition]),
}) satisfies z.ZodType<Required<SandboxBox['config']>>;

const visualizers = z.object({
  aliases: z.record(z.string()),
  order: z.array(z.string()),
}) satisfies z.ZodType<Required<SandboxBox['visualizers']>>;

export const sandboxBox = z.object({
  problem: z.string(),
  algorithm: z.string(),
  config: config.optional(),
  visualizers: visualizers,
}) satisfies z.ZodType<SandboxBox>;
