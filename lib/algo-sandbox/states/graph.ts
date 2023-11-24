import { createState } from '@algo-sandbox/core';
import { z } from 'zod';

export const graphEdge = z.union([
  z.tuple([z.string(), z.string()]),
  z.tuple([z.number(), z.number()]),
]);

export const graphNode = z.object({
  id: z.string(),
});

export const nodeGraph = createState(
  'Node graph',
  z.object({
    nodes: z.array(graphNode),
    edges: z.array(graphEdge),
    directed: z.boolean(),
  }),
);

export const undirectedGraph = createState(
  'Undirected graph',
  nodeGraph.shape.extend({
    directed: z.literal(false),
  }),
);

export const directedGraph = createState(
  'Directed graph',
  nodeGraph.shape.extend({
    directed: z.literal(true),
  }),
);

export const searchGraph = createState(
  'Search graph',
  nodeGraph.shape.extend({
    startId: z.string(),
    endId: z.string(),
  }),
);

export const graphSearchAlgorithmState = createState(
  'Graph search algorithm state',
  z.object({
    graph: searchGraph.shape,
    toVisit: z.array(z.string()),
    visited: z.set(z.string()),
    currentNodeId: z.string().nullable(),
  }),
);
