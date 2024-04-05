import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: {
    key: 'problem.arrays.numberArray',
    parameters: { array: [12, 49, 31, 3, 16, 41, 4, 28, 20, 52] },
  },
  algorithm: '.',
  visualizers: {
    aliases: { 'visualizer-0': 'visualizer.charts.barChart' },
    order: ['visualizer-0'],
  },
  config: {
    adapters: { 'adapter-0': 'adapter.sorting.sortingStateToColor' },
    composition: {
      type: 'tree',
      connections: [
        { fromKey: 'problem', fromSlot: '.', toKey: 'algorithm', toSlot: '.' },
        {
          fromKey: 'algorithm',
          fromSlot: 'array',
          toKey: 'visualizer-0',
          toSlot: 'array',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'states',
          toKey: 'adapter-0',
          toSlot: 'sortingStates',
        },
        {
          fromKey: 'adapter-0',
          fromSlot: 'backgroundColors',
          toKey: 'visualizer-0',
          toSlot: 'backgroundColors',
        },
      ],
    },
  },
  componentNames: {
    'visualizer-0': 'Current array',
  },
};

export default box;
