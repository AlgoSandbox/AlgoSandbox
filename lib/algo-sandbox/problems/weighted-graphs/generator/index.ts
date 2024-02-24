import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { searchGraph, undirectedGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type UndirectedGraph = z.infer<typeof undirectedGraph.shape>;

const weightedGraphGenerator = createParameterizedProblem({
  name: 'Weighted Search graph generator',
  type: searchGraph,
  parameters: {
    edges: SandboxParam.string(
      'Weighted Edges',
      'A-B-1,B-C-1,C-D-1,D-E-1,E-F-1,F-G-1,G-H-1,A-D-5,A-H-10,D-H-5',
      (value) =>
        value.split(',').every((edge) => edge.split('-').length === 3) ||
        'Invalid format; expected input in the form of "Node-Node-Cost"',
    ),
    startNode: SandboxParam.string('Start Node', 'A'),
    goalNode: SandboxParam.string('Goal Node', 'H'),
  },
  getInitialState: (parameters) => {
    const edgesSchema = z
      .string()
      .refine((value) => {
        return value
          .trim()
          .split(',')
          .every((edge) => edge.split('-').length === 3);
      })
      .transform((value) => {
        return value
          .trim()
          .split(',')
          .map((edge) => {
            const [source, target, weight] = edge.split('-');
            return {
              source,
              target,
              weight: parseFloat(weight),
              label: weight.toString(),
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
      edges: edges,
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
    return `Weighted Graph ${edges} with ${startNode} start node and ${goalNode} goal node`;
  },
});

export default weightedGraphGenerator;
