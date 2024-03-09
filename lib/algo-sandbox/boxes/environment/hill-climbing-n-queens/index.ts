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
          fromSlot: '.',
          toKey: 'adapter-0',
          toSlot: '.',
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
