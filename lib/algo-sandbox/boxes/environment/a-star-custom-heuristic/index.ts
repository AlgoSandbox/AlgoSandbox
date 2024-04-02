import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.weightedGraphs.generator',
  algorithm: { key: 'algorithm.search.aStarEnvironment', parameters: {} },
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
      'visualizer-1': 'visualizer.primitives.objectInspector',
      'visualizer-2': 'visualizer.graphs.searchGraph',
    },
    order: ['visualizer-0', 'visualizer-2', 'visualizer-1'],
  },
  config: {
    adapters: {
      'adapter-0': 'adapter.environment.envToGraph',
      'adapter-1': 'adapter.environment.searchGraphToEnv',
      'adapter-2': {
        key: 'adapter.environment.heuristicGraphCustom',
        parameters: {
          // eslint-disable-next-line quotes
          code: "import { z } from 'zod';\nimport { searchGraph } from '@algo-sandbox/states';\n\ntype SearchGraph = z.infer<typeof searchGraph.shape>;\n\nexport default function heuristic(searchGraph: SearchGraph, state: Record<string, any>) {\n  // perfect heuristic\n  const currentNodeId = state.currentNodeId;\n\n  if (searchGraph.endId === currentNodeId) {\n    return 0;\n  }\n\n  const stack = [currentNodeId];\n  const visited = new Set<string>();\n  const costs = new Map<string, number>();\n  costs.set(currentNodeId, 0);\n\n  while (stack.length > 0) {\n    stack.sort().reverse();\n    const nodeId = stack.pop() as string;\n    if (nodeId === searchGraph.endId) {\n      return costs.get(nodeId) as number;\n    }\n\n    if (visited.has(nodeId)) {\n      continue;\n    }\n\n    visited.add(nodeId);\n\n    const edges = searchGraph.edges.filter(\n      (edge) =>\n        edge.source === nodeId ||\n        (!searchGraph.directed && edge.target === nodeId),\n    );\n\n    for (const edge of edges) {\n      const nextNodeId =\n        edge.source === nodeId ? edge.target : edge.source;\n      const cost = (edge.weight ?? 1) + (costs.get(nodeId) as number);\n      if (\n        !costs.has(nextNodeId) ||\n        cost < (costs.get(nextNodeId) as number)\n      ) {\n        costs.set(nextNodeId, cost);\n        stack.push(nextNodeId);\n      }\n    }\n  }\n\n  return costs.get(searchGraph.endId) ?? Infinity;\n},\n",
        },
      },
    },
    composition: {
      type: 'tree',
      connections: [
        { fromKey: 'problem', fromSlot: '.', toKey: 'adapter-1', toSlot: '.' },
        {
          fromKey: 'adapter-0',
          fromSlot: '.',
          toKey: 'visualizer-0',
          toSlot: '.',
        },
        {
          fromKey: 'problem',
          fromSlot: '.',
          toKey: 'visualizer-2',
          toSlot: 'graph',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'frontier',
          toKey: 'visualizer-2',
          toSlot: 'frontier',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'visited',
          toKey: 'visualizer-2',
          toSlot: 'visited',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'currentNodeId',
          toKey: 'visualizer-2',
          toSlot: 'currentNodeId',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'initialNodeId',
          toKey: 'visualizer-2',
          toSlot: 'initialNodeId',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'currentState',
          toKey: 'adapter-0',
          toSlot: 'currentState',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'initialState',
          toKey: 'adapter-0',
          toSlot: 'initialState',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'actions',
          toKey: 'adapter-0',
          toSlot: 'actions',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'visited',
          toKey: 'adapter-0',
          toSlot: 'visited',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'frontier',
          toKey: 'adapter-0',
          toSlot: 'frontier',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'searchTree',
          toKey: 'adapter-0',
          toSlot: 'searchTree',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'getStateKey',
          toKey: 'adapter-0',
          toSlot: 'getStateKey',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'render',
          toKey: 'adapter-0',
          toSlot: 'render',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: '.',
          toKey: 'algorithm',
          toSlot: 'environment',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: '.',
          toKey: 'visualizer-1',
          toSlot: 'object',
        },
        {
          fromKey: 'problem',
          fromSlot: '.',
          toKey: 'adapter-2',
          toSlot: 'graph',
        },
        {
          fromKey: 'adapter-2',
          fromSlot: 'heuristic',
          toKey: 'algorithm',
          toSlot: 'heuristic',
        },
      ],
    },
  },
  componentNames: {
    'visualizer-2': 'State space',
    'visualizer-0': 'Search graph',
  },
};

export default box;
