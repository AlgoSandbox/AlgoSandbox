import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.weightedGraphs.generator',
  algorithm: 'algorithm.search.ucsEnvironment',
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
        { fromKey: 'problem', fromSlot: '.', toKey: 'adapter-1', toSlot: '.' },
        {
          fromKey: 'adapter-1',
          fromSlot: '.',
          toKey: 'algorithm',
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
      ],
    },
  },
  componentNames: {
    'visualizer-1': '',
    'visualizer-2': 'State space',
    'visualizer-0': 'Search graph',
  },
};

export default box;
