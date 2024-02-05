import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.graphs.fiveNodes',
  algorithm: 'algorithm.search.bfs',
  algorithmVisualizers: {
    adapters: {},
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
