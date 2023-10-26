import { Box } from '@algo-sandbox/core';
import { fiveNodes } from '@algo-sandbox/problems';
import { searchGraphVisualizer } from '@algo-sandbox/visualizers';

import algorithm from '.';

const box: Box = {
  problem: fiveNodes,
  problemAlgorithmAdapters: [],
  algorithm,
  algorithmVisualizerAdapters: [],
  visualizer: searchGraphVisualizer,
};

export default box;
