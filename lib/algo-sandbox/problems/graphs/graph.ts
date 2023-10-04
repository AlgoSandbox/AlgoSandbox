export type GraphEdge = [string, string] | [number, number];
export type GraphNode = {
  id: string;
};

export type NodeGraph = {
  nodes: Array<GraphNode>;
  edges: Array<GraphEdge>;
  directed: boolean;
};

export type UndirectedGraph = NodeGraph & {
  directed: false;
};

export type DirectedGraph = NodeGraph & {
  directed: false;
};
