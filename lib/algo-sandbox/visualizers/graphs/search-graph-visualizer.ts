import { SearchGraphState } from '../../algorithms/search';
import { Visualizer } from '../../core/visualize';
import nodeGraphVisualizer from './parametered/node-graph-visualizer';

const searchGraphVisualizer: Visualizer<SearchGraphState> = (() => {
  return {
    visualize: (searchGraph) => {
      return nodeGraphVisualizer
        .create({
          renderNode: (node) => {
            node
              .fill(({ id: nodeId }) => {
                if (searchGraph.currentNodeId === nodeId) {
                  return '#cdf5b8';
                }
                if (searchGraph.visited.has(nodeId)) {
                  return '#a1a1a1';
                }
                return 'white';
              })
              .raw((selection) => {
                // selection.attr('stroke-width', 20);
              });
          },
        })
        .visualize(searchGraph.graph);
    },
  };
})();

export default searchGraphVisualizer;
