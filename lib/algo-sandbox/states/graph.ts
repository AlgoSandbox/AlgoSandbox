import { z } from 'zod';

export const graphEdge = z.union([
  z.tuple([z.string(), z.string()]),
  z.tuple([z.number(), z.number()]),
]);

export const graphNode = z.object({
  id: z.string(),
});

export const nodeGraph = z.object({
  nodes: z.array(graphNode),
  edges: z.array(graphEdge),
  directed: z.boolean(),
});

export const undirectedGraph = nodeGraph.extend({
  directed: z.literal(false),
});

export const directedGraph = nodeGraph.extend({
  directed: z.literal(true),
});

export const searchGraph = nodeGraph.extend({
  startId: z.string(),
  endId: z.string(),
});
