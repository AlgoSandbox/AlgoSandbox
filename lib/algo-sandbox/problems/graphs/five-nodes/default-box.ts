import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: '.',
  algorithm: 'algorithm.search.dfs',
  algorithmVisualizers: {
    visualizers: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
    },
    visualizerOrder: ['visualizer-0'],
    composition: {
      type: 'flat',
      order: ['algorithm', 'visualizer-0'],
    },
  },
};

export default box;
