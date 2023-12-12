import { searchGraph } from '@algo-sandbox/states';
import { z } from 'zod';

export const graphSearchAlgorithmState = z.object({
  graph: searchGraph,
  toVisit: z.array(z.string()),
  visited: z.set(z.string()),
  currentNodeId: z.string().nullable(),
});
