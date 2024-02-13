import {
  AlgorithmVisualizersTree,
  SandboxAdapter,
  SandboxProblem,
  SandboxStateType,
} from '@algo-sandbox/core';
import { ZodError } from 'zod';

function topologicalSort(graph: Record<string, Array<string>>) {
  const visited = new Set<string>();
  const result: Array<string> = [];

  function dfs(node: string) {
    if (visited.has(node)) {
      return;
    }

    visited.add(node);

    for (const neighbor of graph[node] ?? []) {
      dfs(neighbor);
    }

    result.push(node);
  }

  for (const node of Object.keys(graph)) {
    dfs(node);
  }

  return result.reverse();
}

function buildGraphFromAdapterConfiguration(
  adapterConfiguration: AlgorithmVisualizersTree,
) {
  const graph: Record<
    string,
    Record<string, Array<{ fromSlot: string; toSlot: string }>>
  > = {};

  adapterConfiguration.composition.connections.forEach(
    ({ fromKey, fromSlot, toKey, toSlot }) => {
      if (graph[fromKey] === undefined) {
        graph[fromKey] = {};
      }

      if (graph[fromKey][toKey] === undefined) {
        graph[fromKey][toKey] = [];
      }

      graph[fromKey][toKey].push({ fromSlot, toSlot });
    },
  );

  return graph;
}

export default function solveFlowchart({
  adapterConfiguration,
  problem,
  algorithmState,
  adapters,
}: {
  adapterConfiguration: AlgorithmVisualizersTree;
  problem: SandboxProblem<SandboxStateType>;
  algorithmState: Record<string, unknown> | undefined;
  adapters: Record<
    string,
    SandboxAdapter<SandboxStateType, SandboxStateType> | undefined
  >;
}) {
  const graph = buildGraphFromAdapterConfiguration(adapterConfiguration);
  const nodesToExplore = topologicalSort(
    Object.fromEntries(
      Object.keys(graph).map((key) => [key, Object.keys(graph[key])]),
    ),
  );

  const outputs: Record<string, Record<string, unknown>> = {
    problem: problem.initialState,
    algorithm: algorithmState ?? {},
  };

  const inputs: Record<string, Record<string, unknown>> = {};
  const inputErrors: Record<string, Record<string, ZodError>> = {};

  while (nodesToExplore.length > 0) {
    const node = nodesToExplore.shift()!;
    const neighbors = graph[node] ?? {};

    // Try to calculate the state of the node from intermediates
    if (outputs[node] === undefined && node in adapters) {
      // Node should be an adapter
      const adapter = adapters[node];
      if (adapter === undefined) {
        continue;
      }
      // Inputs should be full
      const result = adapter.accepts.shape.safeParse(inputs[node]);

      if (!result.success) {
        inputErrors[node] = {};
        Object.entries(adapter.accepts.shape.shape).forEach(
          ([inputSlot, inputSlotShape]) => {
            const parseResult = inputSlotShape.safeParse(
              inputs[node]?.[inputSlot],
            );
            if (!parseResult.success) {
              inputErrors[node][inputSlot] = parseResult.error;
            }
          },
        );
        continue;
      }
      const output = adapter.transform(result.data);
      outputs[node] = output;
    }

    for (const [neighbor, connections] of Object.entries(neighbors)) {
      connections.forEach(({ fromSlot, toSlot }) => {
        inputs[neighbor] = {
          ...inputs[neighbor],
          [toSlot]: outputs[node][fromSlot],
        };
      });
    }
  }
  return { inputs, outputs, inputErrors };
}
