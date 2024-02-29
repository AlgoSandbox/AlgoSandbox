import {
  BoxConfigTree,
  SandboxAdapter,
  SandboxStateType,
  SandboxVisualizer,
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

function buildGraphFromBoxConfig(boxConfig: BoxConfigTree) {
  const graph: Record<
    string,
    Record<string, Array<{ fromSlot: string; toSlot: string }>>
  > = {};

  boxConfig.composition.connections.forEach(
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
  config,
  problemState,
  algorithmState,
  adapters,
  visualizers,
}: {
  config: BoxConfigTree;
  problemState: Record<string, unknown> | undefined;
  algorithmState?: Record<string, unknown> | undefined;
  adapters: Record<
    string,
    SandboxAdapter<SandboxStateType, SandboxStateType> | undefined
  >;
  visualizers: Record<
    string,
    SandboxVisualizer<SandboxStateType, unknown> | undefined
  >;
}) {
  const graph = buildGraphFromBoxConfig(config);
  const nodesToExplore = topologicalSort(
    Object.fromEntries(
      Object.keys(graph).map((key) => [key, Object.keys(graph[key])]),
    ),
  );

  const outputs: Record<string, Record<string, unknown> | undefined> = {
    problem: problemState,
    algorithm: algorithmState,
  };

  const inputs: Record<string, Record<string, unknown>> = {};
  const inputErrors: Record<string, Record<string, ZodError>> = {};

  // Keep track of which nodes are using the "all" input
  const isUsingAllInput: Record<string, boolean> = {};

  while (nodesToExplore.length > 0) {
    const node = nodesToExplore.shift()!;
    const neighbors = graph[node] ?? {};

    if (isUsingAllInput[node]) {
      inputs[node] = inputs[node]['.'] as Record<string, unknown>;
    }

    // Try to calculate the state of the node from intermediates
    if (outputs[node] === undefined) {
      // Node should be an adapter
      const adapter = adapters[node];

      if (adapter !== undefined) {
        // Inputs should be full
        const result = adapter.accepts.shape.safeParse(inputs[node]);

        if (!result.success) {
          inputErrors[node] = {};

          if (isUsingAllInput[node]) {
            inputErrors[node]['.'] = result.error;
          } else {
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
          }
          continue;
        }
        const output = adapter.transform(result.data);
        outputs[node] = output;
      } else {
        const visualizer = visualizers[node] as
          | SandboxVisualizer<SandboxStateType, unknown>
          | undefined;

        if (visualizer === undefined) {
          // TODO: Display error when node cannot be evaluated
          // throw new Error(`No adapter or visualizer for node ${node}`);
          continue;
        }

        const result = visualizer.accepts.shape.safeParse(inputs[node]);

        if (!result.success) {
          inputErrors[node] = {};

          if (isUsingAllInput[node]) {
            inputErrors[node]['.'] = result.error;
          } else {
            Object.entries(visualizer.accepts.shape.shape).forEach(
              ([inputSlot, inputSlotShape]) => {
                const parseResult = inputSlotShape.safeParse(
                  inputs[node]?.[inputSlot],
                );
                if (!parseResult.success) {
                  inputErrors[node][inputSlot] = parseResult.error;
                }
              },
            );
          }
          continue;
        }
      }
    }

    for (const [neighbor, connections] of Object.entries(neighbors)) {
      connections.forEach(({ fromSlot, toSlot }) => {
        inputs[neighbor] = {
          ...inputs[neighbor],
          [toSlot]:
            fromSlot !== '.' ? outputs[node]?.[fromSlot] : outputs[node],
        };
      });

      if (connections.some(({ toSlot }) => toSlot === '.')) {
        isUsingAllInput[neighbor] = true;
      }
    }
  }

  return { inputs, outputs, inputErrors };
}
