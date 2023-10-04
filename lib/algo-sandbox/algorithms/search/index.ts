import { NodeGraph } from '@/lib/algo-sandbox/problems/graphs';
import { breadthFirstSearch } from './BreadthFirstSearch';
import { depthFirstSearch } from './DepthFirstSearch';

export type SearchGraph = NodeGraph & {
  startId: string;
  endId: string;
};

export type SearchGraphState = {
  graph: SearchGraph;
  toVisit: Array<string>;
  visited: Set<string>;
  currentNodeId: string | null;
};

export namespace Search {
  export const bfs = breadthFirstSearch;
  export const dfs = depthFirstSearch;
}
