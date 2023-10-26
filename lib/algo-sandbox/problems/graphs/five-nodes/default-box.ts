import { Search } from '@algo-sandbox/algorithms';
import { Box } from '@algo-sandbox/core';
import { searchGraphVisualizer } from '@algo-sandbox/visualizers';

import problem from '.';

const box: Box = {
  problem,
  problemAlgorithmAdapters: [],
  algorithm: Search.dfs,
  algorithmVisualizerAdapters: [],
  visualizer: searchGraphVisualizer,
};

export default box;
