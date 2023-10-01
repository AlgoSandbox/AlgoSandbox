export type GraphEdge<K> = [K, K];
export type GraphNode<K> = {
  id: K;
};

export type NodeGraph<K = any> = {
  nodes: Array<GraphNode<K>>;
  edges: Array<GraphEdge<K>>;
  directed: boolean;
};

export type UndirectedGraph<K = any> = NodeGraph<K> & {
  directed: false;
};

export type DirectedGraph<K = any> = NodeGraph<K> & {
  directed: false;
};

export * from './examples/undirected-graphs';
