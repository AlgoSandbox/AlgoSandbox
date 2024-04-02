/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createParameterizedAdapter,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import { searchGraph } from '@algo-sandbox/states';
import { evalWithAlgoSandboxServerSide } from '@algo-sandbox/utils';
import { z } from 'zod';

const heuristicInput = createState(
  'Heuristic input',
  z.object({
    graph: searchGraph.shape,
  }),
);

const heuristicOutput = createState(
  'Heuristic output',
  z.object({
    heuristic: z
      .function()
      .args(
        searchGraph.shape.extend({
          currentNodeId: z.string(),
        }),
      )
      .returns(z.number().nullable()),
  }),
);

const defaultHeuristic = `
import { z } from 'zod';
import { searchGraph } from '@algo-sandbox/states';

type SearchGraph = z.infer<typeof searchGraph.shape>;

export default function heuristic(searchGraph: SearchGraph, state: Record<string, any>) {
  // perfect heuristic
  const currentNodeId = state.currentNodeId;

  if (searchGraph.endId === currentNodeId) {
    return 0;
  }

  const stack = [currentNodeId];
  const visited = new Set<string>();
  const costs = new Map<string, number>();
  costs.set(currentNodeId, 0);

  while (stack.length > 0) {
    stack.sort().reverse();
    const nodeId = stack.pop() as string;
    if (nodeId === searchGraph.endId) {
      return costs.get(nodeId) as number;
    }

    if (visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);

    const edges = searchGraph.edges.filter(
      (edge) =>
        edge.source === nodeId ||
        (!searchGraph.directed && edge.target === nodeId),
    );

    for (const edge of edges) {
      const nextNodeId =
        edge.source === nodeId ? edge.target : edge.source;
      const cost = (edge.weight ?? 1) + (costs.get(nodeId) as number);
      if (
        !costs.has(nextNodeId) ||
        cost < (costs.get(nextNodeId) as number)
      ) {
        costs.set(nextNodeId, cost);
        stack.push(nextNodeId);
      }
    }
  }

  return costs.get(searchGraph.endId) ?? Infinity;
},
`;

const customHeuristic = createParameterizedAdapter({
  name: 'Custom heuristic',
  parameters: {
    code: SandboxParam.code('Code', defaultHeuristic),
  },
  accepts: () => heuristicInput,
  outputs: () => heuristicOutput,
  transform: ({ graph }, { code }) => {
    const heuristicEvaluation =
      evalWithAlgoSandboxServerSide<
        (searchGraph: typeof graph, state: Record<string, any>) => number
      >(code);

    const heuristic = heuristicEvaluation.unwrapOr(() => {
      throw new Error('Error in heuristic function definition');
    });
    return {
      heuristic: (state) => {
        return heuristic(graph, state);
      },
    };
  },
});

export default customHeuristic;
