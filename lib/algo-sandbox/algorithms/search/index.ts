import { NodeGraph } from '@algo-sandbox/problems/graphs';

import breadthFirstSearch from './bfs';
import depthFirstSearch from './dfs';

declare module '@algo-sandbox/core' {
  interface SandboxStateNameMap {
    searchGraph: SearchGraph;
    graphSearchAlgorithmState: SearchGraphState;
  }
}

export type SearchGraph = NodeGraph & {
  startId: string;
  endId: string;
};

type SearchGraphState = {
  graph: SearchGraph;
  toVisit: Array<string>;
  visited: Set<string>;
  currentNodeId: string | null;
};

export { breadthFirstSearch as bfs, depthFirstSearch as dfs };
