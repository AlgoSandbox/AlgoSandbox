import { graphNode, nodeGraph } from '@algo-sandbox/states';
import { Button, Input, MaterialSymbol } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import Toggle from '@components/ui/Toggle';
import clsx from 'clsx';
import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  ConnectionLineComponentProps,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  EdgeLabelRenderer,
  EdgeProps,
  EdgeTypes,
  Handle,
  MarkerType,
  Node,
  NodeChange,
  NodeProps,
  NodeTypes,
  Position,
  ReactFlowProvider,
  ReactFlowState,
  useStore,
} from 'reactflow';
import { getStraightPath } from 'reactflow';
import { z } from 'zod';

import { getEdgeParams } from './graph-editor-utils';

type NodeGraph = z.infer<typeof nodeGraph.shape>;
type GraphNode = z.infer<typeof graphNode>;

type NodeCircleData = {
  label: string;
  onLabelChange: (label: string) => void;
};

type EdgeData = {
  weight: number;
  onWeightChange: (weight: number) => void;
};

const connectionNodeIdSelector = (state: ReactFlowState) =>
  state.connectionNodeId;

const proOptions = {
  hideAttribution: true,
};

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  selected,
  data: { weight, onWeightChange } = {
    weight: 1,
    onWeightChange: () => {},
  },
}: EdgeProps<EdgeData>) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source]),
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target]),
  );

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <path
        id={id}
        className={clsx(
          'react-flow__edge-path',
          '!stroke-2',
          selected ? '!stroke-accent' : '!stroke-border',
        )}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          className="nopan nodrag"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            padding: 10,
            pointerEvents: 'all',
          }}
        >
          <div className="relative flex justify-center items-center">
            <div className="absolute w-8 h-8 bg-surface rounded-full" />
            <Input
              className="z-30 -me-3.5 min-w-0 w-16 text-center !bg-transparent hover:!bg-surface hover:border focus:!bg-surface"
              label="Edge weight"
              hideLabel
              value={weight}
              type="number"
              onChange={(e) => {
                onWeightChange(e.target.valueAsNumber);
              }}
            />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path style={connectionLineStyle} fill="none" d={edgePath} />
      <circle
        className="fill-accent stroke-accent"
        cx={toX}
        cy={toY}
        r={3}
        strokeWidth={1.5}
      />
    </g>
  );
}

function NodeCircle({
  selected,
  data: { label, onLabelChange },
}: NodeProps<NodeCircleData>) {
  const connectionNodeId = useStore(connectionNodeIdSelector);

  const [internalLabel, setInternalLabel] = useState(label);

  useEffect(() => {
    setInternalLabel(label);
  }, [label]);

  const isConnecting = !!connectionNodeId;
  // const isTarget = connectionNodeId && connectionNodeId !== id;
  // const label = isTarget ? 'Drop here' : 'Drag to connect';

  return (
    <div
      className={clsx(
        'w-20 h-20 rounded-full bg-surface flex items-center justify-center relative px-2 border-2',
        selected ? 'border-accent' : 'border-border',
      )}
    >
      <div
        className={clsx(
          'w-8 h-8 z-30 bg-surface-high border-2 flex justify-center items-center rounded-full absolute top-0 -translate-y-1/2',
          selected ? 'border-accent' : 'border-border',
        )}
      >
        <MaterialSymbol icon="drag_handle" />
      </div>
      {!isConnecting && (
        <Handle
          className="!bg-transparent !border-none !m-0 !w-full !h-full absolute !top-0 !start-0 !transform-none z-10"
          position={Position.Right}
          type="source"
        />
      )}
      <Handle
        className="!bg-transparent !border-none !m-0 !w-full !h-full absolute !top-0 !start-0 !transform-none z-10"
        position={Position.Left}
        type="target"
        isConnectableStart={false}
      />
      <Input
        className="!min-w-0 w-16 !py-0 z-50 hover:border-border focus:border-border border border-transparent text-center !bg-surface focus:!bg-surface-high hover:!bg-surface-high"
        label="Node id"
        hideLabel
        value={internalLabel}
        onChange={(e) => {
          setInternalLabel(e.target.value);
          onLabelChange(e.target.value);
        }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  node: NodeCircle,
};

const edgeTypes: EdgeTypes = {
  floating: FloatingEdge,
};

const connectionLineStyle = {
  strokeWidth: 3,
  stroke: 'rgb(var(--color-accent))',
};

type GraphEditorGraph = Omit<NodeGraph, 'nodes'> & {
  nodes: Array<{
    id: string;
    label: string;
    position: { x: number; y: number };
  }>;
};

function createInternalGraph(graph: NodeGraph) {
  const { nodes, edges } = graph;

  const simulationNodes = nodes.map((node) => ({
    id: node.id,
    x: 0,
    y: 0,
  }));

  const simulationLinks = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
  }));

  // First simulation to spread nodes far apart
  let simulation = d3
    .forceSimulation(simulationNodes as d3.SimulationNodeDatum[])
    .force('charge', d3.forceManyBody().strength(-10000))
    .force(
      'link',
      d3
        .forceLink<
          d3.SimulationNodeDatum & GraphNode,
          d3.SimulationLinkDatum<d3.SimulationNodeDatum & GraphNode>
        >(simulationLinks)
        .id((d) => d.id)
        .distance(200)
        .strength(1),
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  simulation.tick(10000);

  // Second simulation to settle nodes in place
  simulation = d3
    .forceSimulation(simulationNodes as d3.SimulationNodeDatum[])
    .force('charge', d3.forceManyBody().strength(-1000))
    .force(
      'link',
      d3
        .forceLink<
          d3.SimulationNodeDatum & GraphNode,
          d3.SimulationLinkDatum<d3.SimulationNodeDatum & GraphNode>
        >(simulationLinks)
        .id((d) => d.id)
        .distance(200)
        .strength(1),
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  simulation.tick(10000);

  return {
    ...graph,
    nodes: graph.nodes.map((node) => {
      return {
        ...node,
        label: node.id,
        position: {
          x: simulationNodes.find((n) => n.id === node.id)?.x ?? 0,
          y: simulationNodes.find((n) => n.id === node.id)?.y ?? 0,
        },
      };
    }),
  };
}

function GraphEditor({
  initialGraph,
  onGraphSave,
  onCancel,
}: {
  initialGraph: NodeGraph;
  onGraphSave: (graph: NodeGraph) => void;
  onCancel: () => void;
}) {
  const defaultInternalGraph = useMemo(() => {
    return createInternalGraph(initialGraph);
  }, [initialGraph]);

  const [internalGraph, setInternalGraph] =
    useState<GraphEditorGraph>(defaultInternalGraph);

  useEffect(() => {
    setInternalGraph(createInternalGraph(initialGraph));
  }, [initialGraph]);

  const initialNodes = useMemo(
    () =>
      internalGraph.nodes.map(
        ({ id: nodeId, position }) =>
          ({
            id: nodeId,
            position,
            type: 'node',
            data: {
              label: nodeId,
              onLabelChange: (label) => {
                setInternalGraph((internalGraph) => ({
                  nodes: internalGraph.nodes.map((node) =>
                    node.id === nodeId ? { ...node, label } : node,
                  ),
                  edges: internalGraph.edges,
                  directed: internalGraph.directed,
                }));
              },
            },
          }) satisfies Node<NodeCircleData>,
      ),
    [internalGraph.nodes],
  );

  const initialEdges = useMemo(
    () =>
      internalGraph.edges.map(
        (edge) =>
          ({
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            type: 'floating',
            data: {
              weight: edge.weight ?? 1,
              onWeightChange: (weight) => {
                setInternalGraph((internalGraph) => ({
                  nodes: internalGraph.nodes,
                  edges: internalGraph.edges.map((e) =>
                    e.source === edge.source && e.target === edge.target
                      ? { ...e, weight }
                      : e,
                  ),
                  directed: internalGraph.directed,
                }));
              },
            },
            markerEnd: internalGraph.directed
              ? {
                  type: MarkerType.ArrowClosed,
                  // color: 'rgb(var(--color-accent))',
                  width: 20,
                  height: 20,
                }
              : undefined,
          }) satisfies Edge<EdgeData>,
      ),
    [internalGraph.directed, internalGraph.edges],
  );

  const [nodes, setNodes] = useState<Array<Node<NodeCircleData>>>(initialNodes);
  const [edges, setEdges] = useState<Array<Edge<EdgeData>>>(initialEdges);

  const onNodesChange = useCallback((changes: Array<NodeChange>) => {
    return setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes: Array<EdgeChange>) => {
    return setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const defaultEdgeOptions: DefaultEdgeOptions = useMemo(() => {
    if (internalGraph.directed) {
      return {
        style: { strokeWidth: 3, stroke: 'rgb(var(--color-accent))' },
        type: 'floating',
        markerEnd: {
          type: MarkerType.Arrow,
          color: 'rgb(var(--color-accent))',
        },
      };
    } else {
      return {
        style: { strokeWidth: 3, stroke: 'rgb(var(--color-accent))' },
        type: 'floating',
      };
    }
  }, [internalGraph.directed]);

  useEffect(() => {
    setNodes((nodes) => {
      return initialNodes.map((initialNode) => {
        const node = nodes.find((node) => node.id === initialNode.id);
        if (!node) {
          return initialNode;
        }

        return {
          ...initialNode,
          position: node.position,
        };
      });
    });
  }, [initialNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);

  const onConnect = useCallback((params: Connection) => {
    const source = params.source;
    const target = params.target;

    if (source === null || target === null) {
      return;
    }

    setInternalGraph((internalGraph) => {
      const newEdges = [
        ...internalGraph.edges,
        {
          source,
          target,
        },
      ];

      return {
        nodes: internalGraph.nodes,
        edges: newEdges,
        directed: internalGraph.directed,
      };
    });
  }, []);

  const onNodeAdd = useCallback(() => {
    setInternalGraph((internalGraph) => {
      const newNodes = [
        ...internalGraph.nodes,
        {
          id: `${internalGraph.nodes.length + 1}`,
          label: `${internalGraph.nodes.length + 1}`,
          position: { x: 0, y: 0 },
        },
      ];

      return {
        nodes: newNodes,
        edges: internalGraph.edges,
        directed: internalGraph.directed,
      };
    });
  }, []);

  const onNodesDelete = useCallback((nodes: Array<Node>) => {
    setInternalGraph((internalGraph) => {
      const deletedNodeIds = nodes.map((node) => node.id);
      const newNodes = internalGraph.nodes.filter(
        (node) => !deletedNodeIds.includes(node.id),
      );
      const newEdges = internalGraph.edges.filter(
        (edge) =>
          !deletedNodeIds.includes(edge.source) &&
          !deletedNodeIds.includes(edge.target),
      );

      return {
        ...internalGraph,
        nodes: newNodes,
        edges: newEdges,
      };
    });
  }, []);

  const onEdgesDelete = useCallback((edges: Array<Edge>) => {
    setInternalGraph((internalGraph) => {
      const deletedEdgeIds = edges.map(
        (edge) => `${edge.source}-${edge.target}`,
      );
      const newEdges = internalGraph.edges.filter(
        (edge) => !deletedEdgeIds.includes(`${edge.source}-${edge.target}`),
      );

      return {
        ...internalGraph,
        edges: newEdges,
      };
    });
  }, []);

  const isInternalGraphValid = useMemo(() => {
    const labels = new Set<string>();

    for (const node of internalGraph.nodes) {
      if (labels.has(node.label)) {
        return false;
      }

      labels.add(node.label);
    }

    return true;
  }, [internalGraph]);

  const onGraphSaveClick = useCallback(() => {
    // Make sure each label is different
    const labels = new Set<string>();

    for (const node of internalGraph.nodes) {
      if (labels.has(node.label)) {
        return;
      }

      labels.add(node.label);
    }

    const idToLabel: Record<string, string> = {};

    for (const node of internalGraph.nodes) {
      idToLabel[node.id] = node.label;
    }

    const savedGraph = {
      ...internalGraph,
      nodes: internalGraph.nodes.map((node) => ({
        id: node.label,
      })),
      edges: internalGraph.edges.map((edge) => ({
        source: idToLabel[edge.source],
        target: idToLabel[edge.target],
        weight: edge.weight,
        label: (edge.weight ?? 1).toString(),
      })),
    };

    onGraphSave(savedGraph);
  }, [internalGraph, onGraphSave]);

  return (
    <div className="w-full h-full flex flex-col flex-1">
      <div className="flex justify-between gap-2 mt-2">
        <div className="flex gap-2">
          <Button
            label="Add node"
            variant="filled"
            icon={<MaterialSymbol icon="add" />}
            onClick={onNodeAdd}
          />
          <Toggle
            label="Directed graph"
            value={internalGraph.directed}
            onChange={() => {
              setInternalGraph(
                internalGraph.directed
                  ? convertToUndirected(internalGraph)
                  : convertToDirected(internalGraph),
              );
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button label="Cancel" onClick={onCancel} />
          <Button
            label="Save"
            variant="primary"
            onClick={onGraphSaveClick}
            disabled={!isInternalGraphValid}
          />
        </div>
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodesDelete}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          connectionLineComponent={CustomConnectionLine}
          connectionLineStyle={connectionLineStyle}
          proOptions={proOptions}
          fitView={true}
        >
          <Background className="bg-canvas" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

function convertToDirected(undirectedGraph: GraphEditorGraph) {
  return {
    nodes: undirectedGraph.nodes,
    edges: undirectedGraph.edges.flatMap((edge) => [
      {
        source: edge.source,
        target: edge.target,
        label: edge.label,
        weight: edge.weight,
      },
      {
        source: edge.target,
        target: edge.source,
        label: edge.label,
        weight: edge.weight,
      },
    ]),
    directed: true,
  };
}

function convertToUndirected(directedGraph: GraphEditorGraph) {
  const addedPairs: Record<string, Record<string, boolean>> = {};
  const newEdges: NodeGraph['edges'] = [];

  // add only the first edge of each pair
  for (const edge of directedGraph.edges) {
    if (addedPairs[edge.source]?.[edge.target]) {
      continue;
    }

    addedPairs[edge.source] = {
      ...addedPairs[edge.source],
      [edge.target]: true,
    };
    addedPairs[edge.target] = {
      ...addedPairs[edge.target],
      [edge.source]: true,
    };

    newEdges.push(edge);
  }

  return {
    nodes: directedGraph.nodes,
    edges: newEdges,
    directed: false,
  };
}

export default function GraphEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  const initialGraph = useMemo(() => {
    try {
      return nodeGraph.shape.parse(JSON.parse(value));
    } catch {
      return {
        nodes: [],
        edges: [],
        directed: false,
      };
    }
  }, [value]);

  const onGraphSave = useCallback(
    (graph: NodeGraph) => {
      onChange(JSON.stringify(graph));
      onOpenChange(false);
    },
    [onChange, onOpenChange],
  );

  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog
      title="Graph editor"
      content={
        <GraphEditor
          initialGraph={initialGraph}
          onGraphSave={onGraphSave}
          onCancel={onCancel}
        />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
