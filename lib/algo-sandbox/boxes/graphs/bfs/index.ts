import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.graphs.fiveNodes',
  algorithm: 'algorithm.search.bfs',
  algorithmVisualizers: {
    composition: {
      type: 'flat',
      order: ['algorithm', 'visualizer-0'],
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
