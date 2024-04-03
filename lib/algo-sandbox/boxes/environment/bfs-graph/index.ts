import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.weightedGraphs.generator',
  algorithm: 'algorithm.search.bfsEnvironment',
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
      'visualizer-1': 'visualizer.primitives.array1d',
      'visualizer-2': 'visualizer.graphs.searchGraph',
      'visualizer-3': 'visualizer.primitives.array1d',
    },
    order: ['visualizer-0', 'visualizer-2', 'visualizer-1', 'visualizer-3'],
  },
  config: {
    adapters: {
      'adapter-0': 'adapter.environment.envToGraph',
      'adapter-1': 'adapter.environment.searchGraphToEnv',
      'adapter-2': 'adapter.utils.setToArray',
    },
    composition: {
      type: 'tree',
      connections: [
        {
          fromKey: 'adapter-1',
          fromSlot: '.',
          toKey: 'algorithm',
          toSlot: '.',
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
        { fromKey: 'problem', fromSlot: '.', toKey: 'adapter-1', toSlot: '.' },
        {
          fromKey: 'adapter-0',
          fromSlot: '.',
          toKey: 'visualizer-0',
          toSlot: '.',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'frontier',
          toKey: 'visualizer-1',
          toSlot: 'array',
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
          fromSlot: 'initialNodeId',
          toKey: 'visualizer-2',
          toSlot: 'initialNodeId',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'currentNodeId',
          toKey: 'visualizer-2',
          toSlot: 'currentNodeId',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'visited',
          toKey: 'adapter-2',
          toSlot: 'set',
        },
        {
          fromKey: 'adapter-2',
          fromSlot: 'array',
          toKey: 'visualizer-3',
          toSlot: 'array',
        },
      ],
    },
  },
  componentNames: {
    'visualizer-0': 'Search tree',
    'visualizer-1': 'Frontier',
    'visualizer-2': 'Search graph',
    'visualizer-3': 'Visited',
  },
};

export default box;
