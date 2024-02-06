import 'reactflow/dist/style.css';

import { SandboxVisualizer } from '@algo-sandbox/core';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { useTab } from '@components/tab-manager/TabProvider';
import { Button, MaterialSymbol, ResizeHandle } from '@components/ui';
import Heading, { HeadingContent } from '@components/ui/Heading';
import Dagre from '@dagrejs/dagre';
import { evalSavedObject } from '@utils/evalSavedObject';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDrop } from 'react-dnd';
import { Panel, PanelGroup } from 'react-resizable-panels';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  getConnectedEdges,
  Handle,
  Node,
  NodeChange,
  NodeTypes,
  Position,
  useNodeId,
  useStore,
} from 'reactflow';

import { useBoxContext } from '../box-page';
import VisualizerSelect from './VisualizerSelect';

type FlowNodeProps = {
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

const FlowNodePreview = forwardRef<HTMLDivElement, FlowNodeProps>(
  ({ data: { inputs = [], outputs = [], label } }, ref) => {
    return (
      <div ref={ref} className="px-4">
        <div className="border py-4 relative gap-2 flex items-center justify-center rounded bg-surface-high">
          <div className="flex flex-col">
            {inputs.map(({ id, label }) => (
              <div key={id} id={id} className="flex items-center gap-2 -ms-1">
                <div className="rounded-full w-2 h-2 bg-surface border border-on-surface" />
                <span className="text-sm font-mono">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 text-lg">{label}</div>
          <div className="flex flex-col">
            {outputs.map(({ id, label }) => (
              <div key={id} id={id}>
                <span className="text-sm font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

FlowNodePreview.displayName = 'FlowNodePreview';

const FlowNode = forwardRef<HTMLDivElement, FlowNodeProps>(
  ({ data: { inputs = [], outputs = [], label } }, ref) => {
    const { nodeInternals, edges } = useStore(({ nodeInternals, edges }) => ({
      nodeInternals,
      edges,
    }));
    const nodeId = useNodeId();
    const connectedEdges = useMemo(() => {
      if (nodeId === null) {
        return [];
      }
      const node = nodeInternals.get(nodeId);

      if (node === undefined) {
        return [];
      }

      return getConnectedEdges([node], edges);
    }, [edges, nodeId, nodeInternals]);

    return (
      <div
        className="border ps-8 py-4 relative h-[100px] w-[500px] flex items-center justify-center rounded bg-surface-high"
        ref={ref}
      >
        <div>{label}</div>
        {inputs.map(({ id, label }, index) => (
          <Handle
            className="relative"
            style={{ top: 20 * index + 16 }}
            key={id}
            type="target"
            position={Position.Left}
            id={id}
            isConnectable={
              connectedEdges.filter((edge) => edge.targetHandle === id)
                .length === 0
            }
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
  },
);

FlowNode.displayName = 'FlowNode';

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

const proOptions = { hideAttribution: true };

// const adapterConfiguration = buildAdapterConfiguration({
//   algorithm: 'algorithm.search.bfs',
//   'adapter-0': 'adapter.example.searchGraphToCounter',
//   'adapter-1': 'adapter.example.counterToSearchGraph',
//   'visualizer-0': 'visualizer.graphs.searchGraph',
// })
//   .tree()
//   .build();

export default function AlgorithmVisualizerFlowchart({
  tabId,
}: {
  tabId: string;
}) {
  const { label: tabName } = useTab();
  const { renameTab } = useTabManager();
  const boxName = useBoxContext('boxName.value');
  const algorithm = useBoxContext('algorithm.instance');
  const {
    builtInVisualizerOptions: visualizerOptions,
    builtInAdapterOptions: adapterOptions,
  } = useBuiltInComponents();

  const algorithmVisualizersEvaluated = useBoxContext(
    'algorithmVisualizers.evaluated',
  );

  const setAlgorithmVisualizers = useBoxContext('algorithmVisualizers.set');
  const algorithmVisualizersTree = useBoxContext('algorithmVisualizers.tree');

  const visualizers = useBoxContext('visualizers');

  const selectedVisualizers = useMemo(() => {
    const flattenedOptions = visualizerOptions.flatMap((item) =>
      'options' in item ? item.options : item,
    );
    return visualizers.order.map(
      (key) =>
        flattenedOptions.find(
          (option) => option.key === visualizers.aliases[key],
        )!,
    );
  }, [visualizerOptions, visualizers.aliases, visualizers.order]);

  const selectedAdapters = useMemo(() => {
    const flattenedOptions = adapterOptions.flatMap((item) =>
      'options' in item ? item.options : item,
    );
    return Object.fromEntries(
      Object.entries(algorithmVisualizersTree.adapters ?? {}).map(
        ([alias, key]) => [
          alias,
          flattenedOptions.find((option) => option.key === key)!,
        ],
      ),
    );
  }, [adapterOptions, algorithmVisualizersTree.adapters]);

  const algorithmName = algorithm?.name ?? 'Untitled algorithm';

  const visualizerInstances = useMemo(() => {
    return Object.fromEntries(
      Object.entries(visualizers.aliases).map(([id, visualizerKey]) => {
        const savedVisualizer = selectedVisualizers.find(
          (visualizer) => visualizer.key === visualizerKey,
        )!.value;
        const name = savedVisualizer?.name ?? 'Untitled visualizer';
        const { objectEvaled: visualizer } =
          evalSavedObject<'visualizer'>(savedVisualizer);

        const instance =
          visualizer !== null && 'parameters' in visualizer
            ? visualizer.create()
            : visualizer;

        return [id, { instance, name }];
      }),
    );
  }, [selectedVisualizers, visualizers.aliases]);

  useEffect(() => {
    const newTabName = `Visualizations: ${boxName}`;
    if (tabName !== newTabName) {
      renameTab(tabId, newTabName);
    }
  }, [boxName, renameTab, tabId, tabName]);

  const algorithmOutputs = useMemo(
    () => algorithm?.outputs.shape.shape ?? {},
    [algorithm],
  );

  const initialAdapterNodes = useMemo(
    () =>
      Object.entries(algorithmVisualizersEvaluated.adapters ?? {})
        .filter(([, evaluated]) => evaluated !== undefined)
        .map(([alias, evaluated]) => ({
          alias,
          evaluated: evaluated!,
        }))
        .map(({ alias, evaluated: { name, value: adapter } }) => ({
          id: alias,
          type: 'customFlow',
          width: 500,
          height: 100,
          data: {
            label: name,
            inputs: Object.keys(adapter.accepts.shape.shape).map((param) => ({
              id: param,
              label: param,
            })),
            outputs: Object.keys(adapter.outputs.shape.shape).map((param) => ({
              id: param,
              label: param,
            })),
          },
        })) as Array<Node>,
    [algorithmVisualizersEvaluated.adapters],
  );

  const initialVisualizerNodes = useMemo(() => {
    return Object.entries(visualizerInstances).map(
      ([id, { name, instance }]) => {
        const visualizerInputs = instance?.accepts.shape.shape ?? {};

        return {
          id,
          type: 'customFlow',
          width: 500,
          height: 100,
          data: {
            label: name,
            inputs: Object.keys(visualizerInputs).map((param) => ({
              id: param,
              label: param,
            })),
          },
        };
      },
    ) as Array<Node>;
  }, [visualizerInstances]);

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
        ...initialAdapterNodes,
        ...initialVisualizerNodes,
      ] as Array<Node>,
    [
      algorithmName,
      algorithmOutputs,
      initialAdapterNodes,
      initialVisualizerNodes,
    ],
  );

  const initialEdges = useMemo(() => {
    return algorithmVisualizersEvaluated.composition.connections.map(
      ({ fromKey, fromSlot, toKey, toSlot }) => ({
        id: `${fromKey}-${fromSlot}-${toKey}-${toSlot}`,
        source: fromKey,
        sourceHandle: fromSlot,
        target: toKey,
        targetHandle: toSlot,
        animated: true,
      }),
    ) as Array<Edge>;
  }, [algorithmVisualizersEvaluated]);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {
    const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges);

    // Set position if not already set
    setNodes((oldNodes) => {
      return nodes.map((node) => {
        const oldNode = oldNodes.find((oldNode) => oldNode.id === node.id);

        if (oldNode === undefined || oldNode.position === undefined) {
          return node;
        }

        return {
          ...node,
          position: oldNode.position,
        };
      });
    });
    setEdges((oldEdges) => {
      return edges.map((edge) => {
        const oldEdge = oldEdges.find(
          (oldEdge) =>
            oldEdge.source === edge.source && oldEdge.target === edge.target,
        );

        if (oldEdge === undefined) {
          return edge;
        }

        return {
          ...edge,
          animated: oldEdge.animated,
        };
      });
    });
  }, [initialEdges, initialNodes]);

  const autoLayoutNodes = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
      nodes,
      edges,
    );

    setNodes(newNodes);
    setEdges(newEdges);
  }, [edges, nodes]);

  const onNodesChange = useCallback((changes: Array<NodeChange>) => {
    return setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes: Array<EdgeChange>) => {
    return setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onEdgesDelete = useCallback(
    (edgesToDelete: Array<Edge>) => {
      setAlgorithmVisualizers({
        ...algorithmVisualizersTree,
        composition: {
          ...algorithmVisualizersTree.composition,
          connections: algorithmVisualizersTree.composition.connections.filter(
            ({ fromKey, fromSlot, toKey, toSlot }) =>
              !edgesToDelete.some(
                (edge) =>
                  edge.source === fromKey &&
                  edge.sourceHandle === fromSlot &&
                  edge.target === toKey &&
                  edge.targetHandle === toSlot,
              ),
          ),
        },
      });
    },
    [algorithmVisualizersTree, setAlgorithmVisualizers],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // update adapter config
      const fromKey = connection.source;
      const fromSlot = connection.sourceHandle;
      const toKey = connection.target;
      const toSlot = connection.targetHandle;

      if (
        fromKey === null ||
        toKey === null ||
        fromSlot === null ||
        toSlot === null
      ) {
        return;
      }

      setAlgorithmVisualizers({
        ...algorithmVisualizersTree,
        composition: {
          ...algorithmVisualizersTree.composition,
          connections: [
            ...algorithmVisualizersTree.composition.connections,
            { fromKey, fromSlot, toKey, toSlot },
          ],
        },
      });
    },
    [algorithmVisualizersTree, setAlgorithmVisualizers],
  );

  const [, drop] = useDrop(() => {
    return {
      accept: 'flowchart-node',
      drop: ({
        visualizer,
        id,
      }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visualizer: SandboxVisualizer<any, unknown> | null;
        id: string;
      }) => {
        if (visualizer === null) {
          return;
        }

        const visualizerInputs = visualizer?.accepts.shape.shape ?? [];

        const newNode = {
          id: `visualizer-${id}`,
          type: 'customFlow',
          data: {
            label: visualizer.name,
            inputs: Object.keys(visualizerInputs).map((param) => ({
              id: param,
              label: param,
            })),
          },
        } as Node;

        setNodes((nds) => [...nds, newNode]);
      },
    };
  });

  return (
    <PanelGroup direction="horizontal">
      <Panel className="p-4 flex flex-col items-stretch gap-2">
        <Heading variant="h3">1. Select visualizers</Heading>
        <HeadingContent>
          {visualizers.order.map((alias) => (
            <div className="flex items-end gap-2" key={alias}>
              <VisualizerSelect
                className="flex-1"
                alias={alias}
                onChange={() => {
                  setAlgorithmVisualizers({
                    adapters: algorithmVisualizersTree.adapters,
                    composition: {
                      ...algorithmVisualizersTree.composition,
                      connections:
                        algorithmVisualizersTree.composition.connections.filter(
                          ({ fromKey, toKey }) =>
                            fromKey !== alias && toKey !== alias,
                        ),
                    },
                  });
                }}
              />
              <Button
                label="Remove"
                hideLabel
                icon={<MaterialSymbol icon="delete" />}
                onClick={() => {
                  visualizers.removeAlias(alias);
                  setAlgorithmVisualizers({
                    adapters: algorithmVisualizersTree.adapters,
                    composition: {
                      ...algorithmVisualizersTree.composition,
                      connections:
                        algorithmVisualizersTree.composition.connections.filter(
                          ({ fromKey, toKey }) =>
                            fromKey !== alias && toKey !== alias,
                        ),
                    },
                  });
                }}
              />
            </div>
          ))}
          <CatalogSelect
            label="Add visualizer"
            options={visualizerOptions}
            value={undefined}
            onChange={(value) => {
              const newKey = `visualizer-${
                Object.keys(visualizers.aliases).length
              }`;
              visualizers.appendAlias(newKey, value.key);
            }}
          />
        </HeadingContent>
        <Heading className="mt-4" variant="h3">
          2. Select adapters
        </Heading>
        <HeadingContent>
          {Object.entries(selectedAdapters).map(([alias, option]) => (
            <div className="flex w-full items-end gap-2" key={alias}>
              <CatalogSelect
                containerClassName="flex-1"
                label={alias}
                options={adapterOptions}
                value={option}
                onChange={(value) => {
                  setAlgorithmVisualizers({
                    adapters: {
                      ...algorithmVisualizersTree.adapters,
                      [alias]: value.key,
                    },
                    composition: {
                      ...algorithmVisualizersTree.composition,
                      connections:
                        algorithmVisualizersTree.composition.connections.filter(
                          ({ fromKey, toKey }) =>
                            fromKey !== alias && toKey !== alias,
                        ),
                    },
                  });
                }}
              />
              <Button
                label="Remove"
                hideLabel
                icon={<MaterialSymbol icon="delete" />}
                onClick={() => {
                  setAlgorithmVisualizers({
                    adapters: Object.fromEntries(
                      Object.entries(
                        algorithmVisualizersTree.adapters ?? {},
                      ).filter(([key]) => key !== alias),
                    ),
                    composition: {
                      ...algorithmVisualizersTree.composition,
                      connections:
                        algorithmVisualizersTree.composition.connections.filter(
                          ({ fromKey, toKey }) =>
                            fromKey !== alias && toKey !== alias,
                        ),
                    },
                  });
                }}
              />
            </div>
          ))}
          <CatalogSelect
            label="Add adapter"
            options={adapterOptions}
            value={undefined}
            onChange={(value) => {
              const newKey = `adapter-${
                Object.keys(algorithmVisualizersTree.adapters ?? {}).length
              }`;
              setAlgorithmVisualizers({
                ...algorithmVisualizersTree,
                adapters: {
                  ...algorithmVisualizersTree.adapters,
                  [newKey]: value.key,
                },
              });
            }}
          />
        </HeadingContent>
      </Panel>
      <ResizeHandle />
      <Panel className="relative">
        <ReactFlow
          ref={drop}
          nodeTypes={nodeTypes}
          nodes={nodes.every((node) => node.position) ? nodes : []}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={proOptions}
          fitView={true}
        >
          <Background className="bg-surface" />
        </ReactFlow>
        <div className="absolute top-2 left-0 right-0 mx-auto flex justify-center">
          <div className="rounded-full bg-surface overflow-clip border">
            <Button
              label="Auto layout"
              onClick={autoLayoutNodes}
              icon={<MaterialSymbol icon="mitre" />}
            />
          </div>
        </div>
      </Panel>
    </PanelGroup>
  );
}

// function FlowchartVisualizerNodePreview({
//   instance,
// }: {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   instance: SandboxVisualizer<any>;
// }) {
//   const inputs = useMemo(() => {
//     if (instance === null) {
//       return [];
//     }

//     const accepts = instance.accepts as SandboxStateType;

//     return Object.keys(accepts.shape.shape).map((param) => ({
//       id: param,
//       label: param,
//     }));
//   }, [instance]);

//   const [, drag] = useDrag(
//     () => ({
//       type: 'flowchart-node',
//       item: { visualizer: instance, id },
//       collect: (monitor) => ({
//         opacity: monitor.isDragging() ? 0.5 : 1,
//       }),
//     }),
//     [],
//   );

//   return (
//     <FlowNodePreview ref={drag} data={{ label: visualizerName, inputs }} />
//   );
// }
