import { SandboxVisualizer } from '../../core/visualize';
import nodeGraphVisualizer from './parametered/node-graph-visualizer';

const searchGraphVisualizer: SandboxVisualizer<'graphSearchAlgorithmState'> =
  (() => {
    return {
      accepts: 'graphSearchAlgorithmState',
      visualize: (searchGraph) => {
        return nodeGraphVisualizer
          .create({
            renderNode: (node) => {
              node.fill(({ id: nodeId }) => {
                if (searchGraph.currentNodeId === nodeId) {
                  return '#cdf5b8';
                }
                if (searchGraph.visited.has(nodeId)) {
                  return '#ffe9d5';
                }
                return 'white';
              });
            },
          })
          .visualize({
            _stateName: 'nodeGraph',
            ...searchGraph.graph,
          });
      },
    };
  })();

export default searchGraphVisualizer;
