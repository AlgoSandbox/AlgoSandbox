import { z } from 'zod';

const adapterConfiguration = z.object({
  adapters: z.record(z.string()),
  composition: z.union([
    z.object({
      type: z.literal('tree'),
      connections: z.array(
        z.object({
          fromKey: z.string(),
          fromSlot: z.string(),
          toKey: z.string(),
          toSlot: z.string(),
        }),
      ),
    }),
    z.object({
      type: z.literal('flat'),
      order: z.array(z.string()),
    }),
  ]),
});

export const sandboxBox = z.object({
  problem: z.string(),
  problemAlgorithm: adapterConfiguration.optional(),
  algorithm: z.string(),
  algorithmVisualizer: adapterConfiguration.optional(),
  visualizer: z.string(),
});
