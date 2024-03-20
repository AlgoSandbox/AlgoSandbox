import { z } from 'zod';

export type ComponentTag = z.infer<typeof componentTag>;

export type ComponentConfig = {
  tags: Array<ComponentTag>;
};

export const componentTag = z.enum([
  'graph',
  'grid',
  'uninformed-search',
  'informed-search',
  'local-search',
  'adapter',
  'algorithm',
  'box',
  'problem',
  'visualizer',
  'environment',
  'decision-tree',
]);

export const componentConfig = z.object({
  tags: z.array(componentTag),
});