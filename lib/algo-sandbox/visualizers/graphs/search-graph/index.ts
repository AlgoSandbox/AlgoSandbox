import { SandboxVisualizer } from '@algo-sandbox/core';
import { graphSearchAlgorithmState } from '@algo-sandbox/states';
import nodeGraphVisualizer, {
  NodeGraphVisualizerState,
} from '@algo-sandbox/visualizers/graphs/node-graph';

const searchGraphVisualizer: SandboxVisualizer<
  typeof graphSearchAlgorithmState,
  NodeGraphVisualizerState
> = (() => {
  return {
    name: 'Search graph',
    accepts: graphSearchAlgorithmState,
    visualize: (searchGraph) => {
      return nodeGraphVisualizer
        .create({
          renderNode: (node) => {
            node.fill(({ id: nodeId }) => {
              if (searchGraph.currentNodeId === nodeId) {
                return 'rgb(var(--color-primary))';
              }
              if (searchGraph.visited.has(nodeId)) {
                return 'rgb(var(--color-success))';
              }
              return 'rgb(var(--color-surface))';
            });
            node.textColor(({ id: nodeId }) => {
              if (searchGraph.currentNodeId === nodeId) {
                return 'rgb(var(--color-on-primary))';
              }
              if (searchGraph.visited.has(nodeId)) {
                return 'rgb(var(--color-on-success))';
              }
              return 'rgb(var(--color-on-surface))';
            });
            node.strokeColor(({ id: nodeId }) => {
              if (searchGraph.currentNodeId === nodeId) {
                return 'rgb(var(--color-primary))';
              }
              if (searchGraph.visited.has(nodeId)) {
                return 'rgb(var(--color-success))';
              }
              return 'rgb(var(--color-border))';
            });
          },
        })
        .visualize({
          ...searchGraph.graph,
        });
    },
  };
})();

export default searchGraphVisualizer;
