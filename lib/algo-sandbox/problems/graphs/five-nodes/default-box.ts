import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: '.',
  algorithm: 'algorithm.search.dfs',
  algorithmVisualizers: {
    composition: {
      type: 'flat',
      order: ['algorithm', 'visualizer-0'],
    },
  },
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
    },
    order: ['visualizer-0'],
  },
};

export default box;
