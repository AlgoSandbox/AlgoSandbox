import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.graphs.fiveNodes',
  algorithm: 'algorithm.search.bfs',
  algorithmVisualizers: {
    adapters: {
      'adapter-0': 'adapter.example.searchGraphToCounter',
      'adapter-1': 'adapter.example.counterToSearchGraph',
    },
    composition: {
      type: 'tree',
      connections: [
        {
          fromKey: 'algorithm',
          fromSlot: '.',
          toKey: 'visualizer-0',
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
          toKey: 'adapter-1',
          toSlot: '.',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: '.',
          toKey: 'visualizer-1',
          toSlot: '.',
        },
      ],
    },
  },
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
      'visualizer-1': 'visualizer.graphs.searchGraph',
    },
    order: ['visualizer-0', 'visualizer-1'],
  },
};

export default box;
