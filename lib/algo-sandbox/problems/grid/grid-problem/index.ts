import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { gridWorldState } from '@algo-sandbox/states';

const gridProblem = createParameterizedProblem({
  name: 'Grid world problem',
  type: gridWorldState,
  parameters: {
    grid: SandboxParam.grid('Grid', ''),
  },
  getInitialState: () => {
    // const nodes = Array.from(
    //   new Set(edges.flatMap(({ source, target }) => [source, target])),
    // ).map(function (node) {
    //   return { id: node };
    // });

    // const graph = {
    //   nodes: nodes,
    //   edges: edges as Array<GraphEdge>,
    //   directed: false,
    // } satisfies UndirectedGraph;

    // const initialState = {
    //   ...graph,
    //   startId: parameters.startNode,
    //   endId: parameters.goalNode,
    // };

    // return initialState;
    return {
      width: 0,
      height: 0,
      objects: [],
    };
  },
  getName: () => {
    return 'Grid problem';
  },
});

export default gridProblem;
