import { SandboxBox } from '@algo-sandbox/core';

const gridWorld: SandboxBox = {
  problem: {
    key: 'problem.grid.gridProblem',
    parameters: {
      grid: '{"width":10,"height":10,"objects":[{"type":"wall","x":0,"y":0},{"type":"wall","x":1,"y":0},{"type":"wall","x":2,"y":0},{"type":"wall","x":3,"y":0},{"type":"wall","x":4,"y":0},{"type":"wall","x":5,"y":0},{"type":"wall","x":6,"y":0},{"type":"wall","x":7,"y":0},{"type":"wall","x":8,"y":0},{"type":"wall","x":9,"y":0},{"type":"wall","x":0,"y":1},{"type":"floor","x":1,"y":1},{"type":"floor","x":2,"y":1},{"type":"floor","x":3,"y":1},{"type":"wall","x":4,"y":1},{"type":"floor","x":5,"y":1},{"type":"floor","x":6,"y":1},{"type":"floor","x":7,"y":1},{"type":"floor","x":8,"y":1},{"type":"wall","x":9,"y":1},{"type":"wall","x":0,"y":2},{"type":"floor","x":1,"y":2},{"type":"floor","x":2,"y":2},{"type":"agent","x":2,"y":2},{"type":"floor","x":3,"y":2},{"type":"wall","x":4,"y":2},{"type":"floor","x":5,"y":2},{"type":"floor","x":6,"y":2},{"type":"floor","x":7,"y":2},{"type":"floor","x":8,"y":2},{"type":"wall","x":9,"y":2},{"type":"wall","x":0,"y":3},{"type":"floor","x":1,"y":3},{"type":"floor","x":2,"y":3},{"type":"floor","x":3,"y":3},{"type":"wall","x":4,"y":3},{"type":"floor","x":5,"y":3},{"type":"floor","x":6,"y":3},{"type":"floor","x":7,"y":3},{"type":"floor","x":8,"y":3},{"type":"wall","x":9,"y":3},{"type":"wall","x":0,"y":4},{"type":"floor","x":1,"y":4},{"type":"floor","x":2,"y":4},{"type":"floor","x":3,"y":4},{"type":"wall","x":4,"y":4},{"type":"floor","x":5,"y":4},{"type":"floor","x":6,"y":4},{"type":"floor","x":7,"y":4},{"type":"floor","x":8,"y":4},{"type":"wall","x":9,"y":4},{"type":"wall","x":0,"y":5},{"type":"floor","x":1,"y":5},{"type":"floor","x":2,"y":5},{"type":"floor","x":3,"y":5},{"type":"floor","x":4,"y":5},{"type":"door","x":4,"y":5},{"type":"floor","x":5,"y":5},{"type":"floor","x":6,"y":5},{"type":"floor","x":7,"y":5},{"type":"key","x":7,"y":5},{"type":"floor","x":8,"y":5},{"type":"wall","x":9,"y":5},{"type":"wall","x":0,"y":6},{"type":"floor","x":1,"y":6},{"type":"floor","x":2,"y":6},{"type":"floor","x":3,"y":6},{"type":"wall","x":4,"y":6},{"type":"floor","x":5,"y":6},{"type":"floor","x":6,"y":6},{"type":"floor","x":7,"y":6},{"type":"floor","x":8,"y":6},{"type":"wall","x":9,"y":6},{"type":"wall","x":0,"y":7},{"type":"floor","x":1,"y":7},{"type":"floor","x":2,"y":7},{"type":"floor","x":3,"y":7},{"type":"wall","x":4,"y":7},{"type":"floor","x":5,"y":7},{"type":"floor","x":6,"y":7},{"type":"floor","x":7,"y":7},{"type":"floor","x":8,"y":7},{"type":"wall","x":9,"y":7},{"type":"wall","x":0,"y":8},{"type":"floor","x":1,"y":8},{"type":"floor","x":2,"y":8},{"type":"floor","x":3,"y":8},{"type":"wall","x":4,"y":8},{"type":"floor","x":5,"y":8},{"type":"floor","x":6,"y":8},{"type":"floor","x":7,"y":8},{"type":"floor","x":8,"y":8},{"type":"wall","x":9,"y":8},{"type":"wall","x":0,"y":9},{"type":"wall","x":1,"y":9},{"type":"wall","x":2,"y":9},{"type":"wall","x":3,"y":9},{"type":"wall","x":4,"y":9},{"type":"wall","x":5,"y":9},{"type":"wall","x":6,"y":9},{"type":"wall","x":7,"y":9},{"type":"wall","x":8,"y":9},{"type":"wall","x":9,"y":9}]}',
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

export default gridWorld;
