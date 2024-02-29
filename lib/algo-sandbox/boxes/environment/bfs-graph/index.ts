import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.graphs.tenNodes',
  algorithm: 'algorithm.search.bfsEnvironment',
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
    },
    composition: {
      type: 'tree',
      connections: [
        {
          fromKey: 'problem',
          fromSlot: '.',
          toKey: 'adapter-1',
          toSlot: '.',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: '.',
          toKey: 'algorithm',
          toSlot: '.',
        },
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
      ],
    },
  },
};

export default box;
