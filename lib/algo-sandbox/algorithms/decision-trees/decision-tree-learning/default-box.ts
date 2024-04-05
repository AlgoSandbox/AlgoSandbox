import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.tabular.tabularDataset',
  algorithm: '.',
  visualizers: {
    order: ['visualizer-2', 'visualizer-0'],
    aliases: {
      'visualizer-2': 'visualizer.graphs.nodeGraph',
      'visualizer-0': 'visualizer.primitives.objectInspector',
    },
  },
  config: {
    adapters: {},
    composition: {
      type: 'tree',
      connections: [
        { fromKey: 'problem', fromSlot: '.', toKey: 'algorithm', toSlot: '.' },
        {
          fromKey: 'algorithm',
          fromSlot: 'decisionTree',
          toKey: 'visualizer-0',
          toSlot: 'object',
        },
        {
          fromKey: 'algorithm',
          fromSlot: 'decisionTree',
          toKey: 'visualizer-2',
          toSlot: '.',
        },
      ],
    },
  },
};
export default box;
