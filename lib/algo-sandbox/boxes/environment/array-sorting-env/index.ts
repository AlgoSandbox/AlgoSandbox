import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: {
    key: 'problem.arrays.randomArray',
    parameters: { minValue: 0, maxValue: 100, length: 4, seed: '7' },
  },
  algorithm: 'algorithm.search.ucsEnvironment',
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
      'visualizer-1': 'visualizer.charts.barChart',
      'visualizer-2': 'visualizer.charts.barChart',
      'visualizer-3': 'visualizer.primitives.array1d',
    },
    order: ['visualizer-0', 'visualizer-2', 'visualizer-1', 'visualizer-3'],
  },
  config: {
    adapters: {
      'adapter-0': 'adapter.environment.envToGraph',
      'adapter-1': 'adapter.environment.arrayToEnv',
      'adapter-2': 'adapter.utils.setToArray',
      'adapter-3': { key: 'adapter.utils.get', parameters: { path: 'array' } },
      'adapter-4': { key: 'adapter.utils.get', parameters: { path: '*.cost' } },
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
        { fromKey: 'problem', fromSlot: '.', toKey: 'adapter-1', toSlot: '.' },
        {
          fromKey: 'adapter-1',
          fromSlot: '.',
          toKey: 'algorithm',
          toSlot: '.',
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
          fromKey: 'adapter-3',
          fromSlot: 'valueAtPath',
          toKey: 'visualizer-2',
          toSlot: 'array',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'currentState',
          toKey: 'adapter-3',
          toSlot: 'object',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'frontier',
          toKey: 'visualizer-1',
          toSlot: 'labels',
        },
        {
          fromKey: 'adapter-4',
          fromSlot: 'valueAtPath',
          toKey: 'visualizer-1',
          toSlot: 'array',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'frontier',
          toKey: 'adapter-4',
          toSlot: 'object',
        },
      ],
    },
  },
  componentNames: {
    'visualizer-0': 'Search tree',
    'visualizer-1': 'Frontier with heuristic',
    'visualizer-2': 'Current array',
    'visualizer-3': 'Visited',
  },
};

export default box;
