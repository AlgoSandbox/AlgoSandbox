import { NodeGraph } from '../../problems/graphs';
import { breadthFirstSearch } from './BreadthFirstSearch';
import { depthFirstSearch } from './DepthFirstSearch';

declare module '@/lib/algo-sandbox/core' {
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

namespace Search {
  export const bfs = breadthFirstSearch;
  export const dfs = depthFirstSearch;
}

export default Search;
