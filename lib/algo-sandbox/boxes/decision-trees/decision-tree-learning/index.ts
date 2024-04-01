import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: {
    key: 'problem.tabular.tabularDataset',
    parameters: {
      spreadsheet:
        '{"attributes":["Weather","Energy"],"examples":[{"attributes":{"Weather":"Hot","Energy":"Low"},"classification":"Stay"},{"attributes":{"Weather":"Cold","Energy":"High"},"classification":"Go out"},{"attributes":{"Weather":"Hot","Energy":"High"},"classification":"Stay"},{"attributes":{"Weather":"Cold","Energy":"Medium"},"classification":"Go out"},{"attributes":{"Weather":"Cold","Energy":"Low"},"classification":"Stay"}]}',
    },
  },
  algorithm: 'algorithm.decisionTrees.decisionTreeLearning',
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
