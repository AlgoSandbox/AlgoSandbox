import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { gridWorldState } from '@algo-sandbox/states';

const gridProblem = createParameterizedProblem({
  name: 'Grid world problem',
  type: gridWorldState,
  parameters: {
    grid: SandboxParam.grid('Grid', ''),
  },
  getInitialState: (parameters) => {
    return gridWorldState.shape.parse(JSON.parse(parameters.grid));
  },
  getName: () => {
    return 'Grid problem';
  },
});

export default gridProblem;
