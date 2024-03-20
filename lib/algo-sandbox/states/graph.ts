import { createState } from '@algo-sandbox/core';
import { z } from 'zod';

export const graphEdge = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  weight: z.number().optional(),
});

export const graphNode = z.object({
  id: z.string(),
  label: z.string().optional(),
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
    graph: nodeGraph.shape,
    frontier: z.array(z.string()),
    visited: z.set(z.string()),
    initialNodeId: z.string(),
    currentNodeId: z.string().nullable(),
    nodeDepths: z.record(z.number()).optional(),
  }),
);
