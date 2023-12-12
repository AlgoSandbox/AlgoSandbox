import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { graphEdge, searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type GraphEdge = z.infer<typeof graphEdge>;
type UndirectedGraph = z.infer<typeof undirectedGraph>;

const graphParameterized = createParameterizedProblem({
  name: 'Search graph (parameterized)',
  shape: searchGraph,
  parameters: {
    edges: SandboxParam.string(
      'Edges',
      'A-B,B-C,A-C',
      (value) =>
        value.split(',').every((edge) => edge.split('-').length === 2) ||
        'Invalid format',
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
        edges.reduce((accumulator, value) => accumulator.concat(value), []),
      ),
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
      startId: parameters.start_node,
      endId: parameters.goal_node,
    };

    return initialState;
  },
  getName: ({ edges, start_node, goal_node }) => {
    return `Graph ${edges} with ${start_node} start node and ${goal_node} goal node`;
  },
});

export default graphParameterized;
