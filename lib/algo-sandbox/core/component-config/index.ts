import { z } from 'zod';

export type ComponentTag = z.infer<typeof componentTag>;

export type ComponentConfig = {
  tags: Array<ComponentTag>;
};

export const componentTag = z.enum([
  'adversarial-search',
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
  'chart',
  'sorting',
  'utils',
]);

export const componentConfig = z.object({
  tags: z.array(componentTag),
});
