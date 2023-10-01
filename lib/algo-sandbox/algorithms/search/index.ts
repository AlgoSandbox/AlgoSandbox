import { NodeGraph } from '@/lib/algo-sandbox/problems/graphs';
import { breadthFirstSearch } from './BreadthFirstSearch';

export type SearchGraph = NodeGraph<string> & {
  startId: string;
  endId: string;
};

export namespace SearchAlgorithms {
  export const bfs = breadthFirstSearch;
}
