import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { nodeGraph, searchGraph } from '@algo-sandbox/states';
import { z } from 'zod';

type NodeGraph = z.infer<typeof nodeGraph.shape>;

const defaultGraph: NodeGraph = {
  nodes: 'ABCDEFGH'.split('').map((id) => ({ id })),
  edges: [
    {
      source: 'A',
      target: 'B',
      weight: 1,
      label: '1',
    },
    {
      source: 'B',
      target: 'C',
      weight: 1,
      label: '1',
    },
    {
      source: 'C',
      target: 'D',
      weight: 1,
      label: '1',
    },
    {
      source: 'D',
      target: 'E',
      weight: 1,
      label: '1',
    },
    {
      source: 'E',
      target: 'F',
      weight: 1,
      label: '1',
    },
    {
      source: 'F',
      target: 'G',
      weight: 1,
      label: '1',
    },
    {
      source: 'G',
      target: 'H',
      weight: 1,
      label: '1',
    },
    {
      source: 'A',
      target: 'D',
      weight: 5,
      label: '5',
    },
    {
      source: 'A',
      target: 'H',
      weight: 10,
      label: '10',
    },
    {
      source: 'D',
      target: 'H',
      weight: 5,
      label: '5',
    },
  ],
  directed: false,
};

const weightedGraphGenerator = createParameterizedProblem({
  name: 'Weighted search graph',
  type: searchGraph,
  parameters: {
    graph: SandboxParam.graph(
      'Graph',
      JSON.stringify(defaultGraph),
      (value) => {
        try {
          nodeGraph.shape.parse(JSON.parse(value));
          return true;
        } catch {
          return false;
        }
      },
    ),
    startNode: SandboxParam.string('Start Node', 'A'),
    goalNode: SandboxParam.string('Goal Node', 'H'),
  },
  getInitialState: (parameters) => {
    const graph = (() => {
      try {
        return nodeGraph.shape.parse(JSON.parse(parameters.graph));
      } catch {
        return {
          nodes: [],
          edges: [],
          directed: false,
        };
      }
    })();

    const initialState = {
      ...graph,
      startId: parameters.startNode,
      endId: parameters.goalNode,
    };

    return initialState;
  },
  getName: ({ startNode, goalNode }) => {
    return `Weighted graph with ${startNode} start node and ${goalNode} goal node`;
  },
});

export default weightedGraphGenerator;
