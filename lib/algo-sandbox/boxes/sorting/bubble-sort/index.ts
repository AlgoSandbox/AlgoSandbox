import { SandboxBox } from '@algo-sandbox/core';

const bubbleSort: SandboxBox = {
  problem: {
    key: 'problem.arrays.randomArray',
    parameters: { minValue: 0, maxValue: 100, length: 10, seed: '' },
  },
  algorithm: 'algorithm.sorting.bubbleSort',
  visualizers: {
    aliases: { 'visualizer-0': 'visualizer.charts.barChart' },
    order: ['visualizer-0'],
  },
  config: {
    adapters: {},
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
      ],
    },
  },
};

export default bubbleSort;
