import { SandboxBox } from '@algo-sandbox/core';

const box: SandboxBox = {
  problem: 'problem.graphs.fiveNodes',
  algorithm: 'algorithm.search.bfs',
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
    },
    order: ['visualizer-0'],
  },
};

export default box;
