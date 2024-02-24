import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.weightedGraphs.generator',
  problemAlgorithm: {
    aliases: {
      'adapter-0': 'adapter.environment.searchGraphToEnv',
    },
    composition: {
      type: 'flat',
      order: ['adapter-0'],
    },
  },
  algorithm: 'algorithm.search.ucsEnvironment',
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
      'visualizer-1': 'visualizer.primitives.objectInspector',
      'visualizer-2': 'visualizer.graphs.searchGraph',
    },
    order: ['visualizer-0', 'visualizer-2', 'visualizer-1'],
  },
  algorithmVisualizers: {
    adapters: {
      'adapter-0': 'adapter.environment.envToGraph',
    },
    composition: {
      type: 'tree',
      connections: [
        {
          fromKey: 'algorithm',
          fromSlot: '.',
          toKey: 'adapter-0',
          toSlot: '.',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: '.',
          toKey: 'visualizer-0',
          toSlot: '.',
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
          toKey: 'visualizer-2',
          toSlot: 'graph',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'toVisit',
          toKey: 'visualizer-2',
          toSlot: 'toVisit',
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
      ],
    },
  },
};

export default box;
