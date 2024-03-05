import { createState, SandboxAdapter } from '@algo-sandbox/core';
import { searchGraph } from '@algo-sandbox/states';
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

const searchGraphToEnv: SandboxAdapter<
  typeof heuristicInput,
  typeof heuristicOutput
> = {
  accepts: heuristicInput,
  outputs: heuristicOutput,
  transform: ({ graph: searchGraph }) => {
    return {
      heuristic: (state) => {
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
    };
  },
};

export default searchGraphToEnv;
