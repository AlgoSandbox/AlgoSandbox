import 'reactflow/dist/style.css';

import { Button, Popover } from '@components/ui';
import Dagre from '@dagrejs/dagre';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  Handle,
  Node,
  NodeChange,
  NodeTypes,
  Position,
} from 'reactflow';

import { useBoxContext } from '..';

type VisualizerNodeProps = {
  data: {
    inputs?: Array<{
      id: string;
      label: string;
    }>;
    outputs?: Array<{
      id: string;
      label: string;
    }>;
    label: string;
  };
};

function FlowNode({
  data: { inputs = [], outputs = [], label },
}: VisualizerNodeProps) {
  return (
    <div className="border ps-8 py-4 relative h-[100px] w-[500px] flex items-center justify-center rounded">
      <div>{label}</div>
      {inputs.map(({ id, label }, index) => (
        <Handle
          className="relative"
          style={{ top: 20 * index + 16 }}
          key={id}
          type="target"
          position={Position.Left}
          id={id}
        >
          <span className="absolute start-2 -mt-2 font-mono">{label}</span>
        </Handle>
      ))}
      {outputs.map(({ id, label }, index) => (
        <Handle
          className="relative"
          style={{ top: 20 * index + 16 }}
          key={id}
          type="source"
          position={Position.Right}
          id={id}
        >
          <span className="absolute end-2 -mt-2 font-mono">{label}</span>
        </Handle>
      ))}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  customFlow: FlowNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Array<Node>, edges: Array<Edge>) => {
  g.setGraph({ rankdir: 'LR' });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => g.setNode(node.id, node as Dagre.Label));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export default function AlgorithmVisualizerFlowChartPopover() {
  const algorithm = useBoxContext('algorithm.instance');
  const visualizer = useBoxContext('visualizer.instance');

  const adapters = useBoxContext('algorithmVisualizer.adapters.value');

  const algorithmName = algorithm?.name ?? 'Untitled algorithm';
  const visualizerName = visualizer?.name ?? 'Untitled visualizer';

  const algorithmOutputs = useMemo(
    () => algorithm?.outputs.shape.shape ?? {},
    [algorithm],
  );
  const visualizerInputs = useMemo(
    () => visualizer?.accepts.shape.shape ?? {},
    [visualizer],
  );

  const adapterNodes = useMemo(
    () =>
      adapters.map((adapter) => ({
        id: `adapter-${adapter.key}`,
        type: 'customFlow',
        width: 500,
        height: 100,
        data: {
          label: adapter.label,
          inputs: Object.keys(adapter.value.accepts.shape.shape).map(
            (param) => ({
              id: param,
              label: param,
            }),
          ),
          outputs: Object.keys(adapter.value.outputs.shape.shape).map(
            (param) => ({
              id: param,
              label: param,
            }),
          ),
        },
      })) as Array<Node>,
    [adapters],
  );

  const initialNodes = useMemo(
    () =>
      [
        {
          id: 'algorithm',
          type: 'customFlow',
          width: 500,
          height: 100,
          data: {
            label: algorithmName,
            outputs: Object.keys(algorithmOutputs).map((param) => ({
              id: param,
              label: param,
            })),
          },
        },
        ...adapterNodes,
        {
          id: 'visualizer',
          type: 'customFlow',
          width: 500,
          height: 100,
          data: {
            label: visualizerName,
            inputs: Object.keys(visualizerInputs).map((param) => ({
              id: param,
              label: param,
            })),
          },
        },
      ] as Array<Node>,
    [
      algorithmName,
      algorithmOutputs,
      adapterNodes,
      visualizerName,
      visualizerInputs,
    ],
  );

  const initialEdges = useMemo(() => {
    // To update with actual edges later
    return Object.keys(visualizerInputs).map((parameterName) => ({
      id: 'parameterName',
      source: 'algorithm',
      sourceHandle: parameterName,
      target: 'visualizer',
      targetHandle: parameterName,
      animated: true,
    })) as Array<Edge>;
  }, [visualizerInputs]);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges);

    setNodes(nodes);
    setEdges(edges);
  }, [initialEdges, initialNodes]);

  const onNodesChange = useCallback(
    (changes: Array<NodeChange>) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: Array<EdgeChange>) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Array<Edge>) =>
      setEdges((eds) =>
        eds.filter((ed) => !edgesToDelete.some((e) => e.id === ed.id)),
      ),
    [],
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <Popover
      content={
        <div className="w-[500px] h-[400px] bg-white">
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView={true}
          />
        </div>
      }
    >
      <Button label="View flowchart" />
    </Popover>
  );
}
