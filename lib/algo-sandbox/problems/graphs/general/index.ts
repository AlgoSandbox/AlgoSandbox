import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { graphEdge, searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type GraphEdge = z.infer<typeof graphEdge>;
type UndirectedGraph = z.infer<typeof undirectedGraph.shape>;

const general = createParameterizedProblem({
  name: 'Search graph generator',
  type: searchGraph,
  parameters: {
    edges: SandboxParam.string(
      'Edges',
      'A-B,B-C,A-C',
      (value) =>
        value.split(',').every((edge) => edge.split('-').length === 2) ||
        'Invalid format; expected input in the form of "A-B,B-C,A-C"',
    ),
    startNode: SandboxParam.string('Start Node', 'A'),
    goalNode: SandboxParam.string('Goal Node', 'C'),
  },
  getInitialState: (parameters) => {
    const edgesSchema = z
      .string()
      .refine((value) => {
        return value
          .trim()
          .split(',')
          .every((edge) => edge.split('-').length === 2);
      })
      .transform((value) => {
        return value
          .trim()
          .split(',')
          .map((edge) => {
            const [source, target] = edge.split('-');
            return {
              source,
              target,
            };
          });
      });
    const edges = edgesSchema.parse(parameters.edges);

    const nodes = Array.from(
      new Set(edges.flatMap(({ source, target }) => [source, target])),
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
      startId: parameters.startNode,
      endId: parameters.goalNode,
    };

    return initialState;
  },
  getName: ({ edges, startNode, goalNode }) => {
    return `Graph ${edges} with ${startNode} start node and ${goalNode} goal node`;
  },
});

export default general;
