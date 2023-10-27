import { createParameteredProblem, SandboxParam } from '@algo-sandbox/core';
import { GraphEdge, UndirectedGraph } from '@algo-sandbox/problems';

const graphParametered = createParameteredProblem({
  name: 'Search graph (parametered)',
  shape: 'searchGraph',
  parameters: {
    edges: SandboxParam.string(
      'Edges',
      'A-B,B-C,A-C',
      (value) =>
        value.split(',').every((edge) => edge.split('-').length === 2) ||
        'Invalid format'
    ),
    start_node: SandboxParam.string('Start Node', 'A'),
    goal_node: SandboxParam.string('Goal Node', 'C'),
  },
  getInitialState: (parameters) => {
    const edges = parameters.edges.split(',').map((edge) => {
      return edge.replace(/ /g, '').split('-');
    });
    const nodes = Array.from(
      new Set(
        edges.reduce((accumulator, value) => accumulator.concat(value), [])
      )
    ).map(function (node) {
      return { id: node };
    });

    const graph = {
      nodes: nodes,
      edges: edges as Array<GraphEdge>,
      directed: false,
    } satisfies UndirectedGraph;

    const initialState = {
      ...graph,
      _stateName: 'searchGraph' as const,
      startId: parameters.start_node,
      endId: parameters.goal_node,
    };

    return initialState;
  },
  getName: ({ edges, start_node, goal_node }) => {
    return `Graph ${edges} with ${start_node} start node and ${goal_node} goal node`;
  },
});

export default graphParametered;
