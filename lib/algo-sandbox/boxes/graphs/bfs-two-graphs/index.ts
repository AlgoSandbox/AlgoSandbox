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
          fromSlot: 'graph',
          toKey: 'visualizer-0',
          toSlot: 'graph',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'toVisit',
          toKey: 'visualizer-0',
          toSlot: 'toVisit',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'visited',
          toKey: 'visualizer-0',
          toSlot: 'visited',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'currentNodeId',
          toKey: 'visualizer-0',
          toSlot: 'currentNodeId',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'graph',
          toKey: 'adapter-0',
          toSlot: 'graph',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'toVisit',
          toKey: 'adapter-0',
          toSlot: 'toVisit',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'visited',
          toKey: 'adapter-0',
          toSlot: 'visited',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'currentNodeId',
          toKey: 'adapter-0',
          toSlot: 'currentNodeId',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'counter',
          toKey: 'adapter-1',
          toSlot: 'counter',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'graph',
          toKey: 'visualizer-1',
          toSlot: 'graph',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'toVisit',
          toKey: 'visualizer-1',
          toSlot: 'toVisit',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'visited',
          toKey: 'visualizer-1',
          toSlot: 'visited',
        },
        {
          fromKey: 'adapter-1',
          fromSlot: 'currentNodeId',
          toKey: 'visualizer-1',
          toSlot: 'currentNodeId',
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
