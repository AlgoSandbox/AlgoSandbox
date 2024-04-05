import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.backtracking.nQueens',
  algorithm: 'algorithm.search.hillClimbing',
  visualizers: {
    aliases: {
      'visualizer-3': 'visualizer.primitives.array2d',
    },
    order: ['visualizer-3'],
  },
  config: {
    adapters: {
      'adapter-0': 'adapter.environment.envToGraph',
      'adapter-1': {
        key: 'adapter.utils.get',
        parameters: {
          path: 'board',
        },
      },
    },
    composition: {
      type: 'tree',
      connections: [
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
          fromKey: 'problem',
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
          fromKey: 'problem',
          fromSlot: '.',
          toKey: 'algorithm',
          toSlot: '.',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'currentState',
          toKey: 'adapter-1',
          toSlot: 'object',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'valueAtPath',
          toKey: 'visualizer-3',
          toSlot: 'array',
        },
      ],
    },
  },
};

export default box;
