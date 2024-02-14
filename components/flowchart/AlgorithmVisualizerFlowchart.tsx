import 'reactflow/dist/style.css';

import { useFlowchartCalculations } from '@app/playground/BoxPage';
import AlgorithmSelect from '@components/box-page/app-bar/AlgorithmSelect';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import ProblemSelect from '@components/box-page/app-bar/ProblemSelect';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { useTab } from '@components/tab-manager/TabProvider';
import { Button, MaterialSymbol, ResizeHandle, Tooltip } from '@components/ui';
import Heading, { HeadingContent } from '@components/ui/Heading';
import Dagre from '@dagrejs/dagre';
import { evalSavedObject } from '@utils/evalSavedObject';
import clsx from 'clsx';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import { ZodError } from 'zod';

import { useBoxContext } from '../box-page';
import AdapterSelect from './AdapterSelect';
import VisualizerSelect from './VisualizerSelect';

type FlowNodeProps = {
  data: {
    inputs?: Array<{
      id: string;
      label: string;
      hasValue: boolean;
      error: ZodError | null;
    }>;
    outputs?: Array<{
      id: string;
      label: string;
      hasValue: boolean;
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

type FlowNode = Node<FlowNodeProps['data']>;

const FlowNodeCard = forwardRef<HTMLDivElement, FlowNodeProps>(
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
        className={clsx(
          'border relative h-[200px] w-[500px] flex flex-col items-stretch rounded bg-surface-high',
        )}
        ref={ref}
      >
        <div className="flex justify-center text-lg font-semibold border-b py-2">
          {label}
        </div>
        <div className="flex justify-between py-2">
          <div className="flex flex-col gap-2 absolute -start-2">
            {inputs.map(({ id, label, hasValue, error }) => {
              const isConnected = connectedEdges.some(
                (edge) => edge.targetHandle === id,
              );
              const hasError = error !== null;
              return (
                <div key={id} className="flex items-center gap-2">
                  <Handle
                    className={clsx(
                      hasError && '!bg-danger',
                      !hasError && [
                        isConnected && [
                          hasValue ? '!bg-accent' : '!bg-surface',
                        ],
                        !isConnected && '!bg-surface-high',
                      ],
                    )}
                    type="target"
                    position={Position.Left}
                    id={id}
                    isConnectable={!isConnected}
                  />
                  <span
                    className={clsx(
                      'font-mono',
                      hasError && 'text-danger',
                      !hasError && [
                        hasValue ? 'text-on-surface' : 'text-muted',
                      ],
                    )}
                  >
                    {label}
                  </span>
                  {hasError && (
                    <Tooltip
                      content={
                        <ul>
                          {error.issues.map(({ path, message }) => (
                            <li key={path.join('.')}>{message}</li>
                          ))}
                        </ul>
                      }
                    >
                      <MaterialSymbol icon="error" className="text-danger" />
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col items-end gap-2 absolute -end-2">
            {outputs.map(({ id, label, hasValue }) => {
              const isConnected = connectedEdges.some(
                (edge) => edge.sourceHandle === id,
              );

              return (
                <div key={id} className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'font-mono',
                      hasValue ? 'text-on-surface' : 'text-muted',
                    )}
                  >
                    {label}
                  </span>
                  <Handle
                    className={clsx(
                      isConnected && [hasValue ? '!bg-accent' : '!bg-surface'],
                      !isConnected && '!bg-surface-high',
                    )}
                    type="source"
                    position={Position.Right}
                    id={id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

FlowNodeCard.displayName = 'FlowNode';

const nodeTypes: NodeTypes = {
  customFlow: FlowNodeCard,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: Array<Omit<Node, 'position'>>,
  edges: Array<Edge>,
) => {
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
  const { inputs, outputs, inputErrors } = useFlowchartCalculations();
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
    const newTabName = 'Config';
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
        .map(
          ({ alias, evaluated: { name, value: adapter } }) =>
            ({
              id: alias,
              type: 'customFlow',
              width: 500,
              height: 100,
              data: {
                label: name,
                inputs: Object.keys(adapter.accepts.shape.shape).map(
                  (param) => ({
                    id: param,
                    label: param,
                    hasValue: Object.hasOwn(inputs[alias] ?? {}, param),
                    error: inputErrors[alias]?.[param] ?? null,
                  }),
                ),
                outputs: Object.keys(adapter.outputs.shape.shape).map(
                  (param) => ({
                    id: param,
                    label: param,
                    hasValue: Object.hasOwn(outputs[alias] ?? {}, param),
                  }),
                ),
              },
            }) satisfies Omit<FlowNode, 'position'>,
        ),
    [algorithmVisualizersEvaluated.adapters, inputErrors, inputs, outputs],
  );

  const initialVisualizerNodes = useMemo(() => {
    return Object.entries(visualizerInstances).map(
      ([alias, { name, instance }]) => {
        const visualizerInputs = instance?.accepts.shape.shape ?? {};

        return {
          id: alias,
          type: 'customFlow',
          width: 500,
          height: 200,
          data: {
            label: name,
            inputs: Object.keys(visualizerInputs).map((param) => ({
              id: param,
              label: param,
              hasValue: Object.hasOwn(inputs[alias] ?? {}, param),
              error: inputErrors[alias]?.[param] ?? null,
            })),
          },
        } satisfies Omit<FlowNode, 'position'>;
      },
    );
  }, [inputErrors, inputs, visualizerInstances]);

  const initialNodes = useMemo(
    () =>
      [
        {
          id: 'algorithm',
          type: 'customFlow',
          width: 500,
          height: 200,
          data: {
            label: algorithmName,
            outputs: Object.keys(algorithmOutputs).map((param) => ({
              id: param,
              label: param,
              // TODO: Determine if algo is valid
              hasValue: Object.hasOwn(outputs['algorithm'], param),
            })),
          },
        },
        ...initialAdapterNodes,
        ...initialVisualizerNodes,
      ] satisfies Array<Omit<FlowNode, 'position'>>,
    [
      algorithmName,
      algorithmOutputs,
      initialAdapterNodes,
      initialVisualizerNodes,
      outputs,
    ],
  );

  const initialEdges = useMemo(() => {
    return algorithmVisualizersEvaluated.composition.connections.map(
      ({ fromKey, fromSlot, toKey, toSlot }) => {
        const hasValue = Object.hasOwn(outputs[fromKey] ?? {}, fromSlot);
        return {
          id: `${fromKey}-${fromSlot}-${toKey}-${toSlot}`,
          source: fromKey,
          sourceHandle: fromSlot,
          target: toKey,
          targetHandle: toSlot,
          className: clsx([
            String.raw`[&_.react-flow\_\_edge-path]:stroke-2 [&_.react-flow\_\_edge-path]:hover:!stroke-[4px]`,
            hasValue && String.raw`[&>.react-flow\_\_edge-path]:!stroke-label`,
            !hasValue &&
              String.raw`[&>.react-flow\_\_edge-path]:!stroke-border`,
            String.raw`[&.selected.react-flow\_\_edge>.react-flow\_\_edge-path]:!stroke-accent [&.selected.react-flow\_\_edge>.react-flow\_\_edge-path]:!stroke-[4px]`,
          ]),
          animated: hasValue,
        };
      },
    ) as Array<Edge>;
  }, [algorithmVisualizersEvaluated.composition.connections, outputs]);

  const [nodes, setNodes] = useState<Array<FlowNode>>(
    // TODO: Remove typecast
    initialNodes as Array<FlowNode>,
  );
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
    setEdges(edges);
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

  // const [, drop] = useDrop(() => {
  //   return {
  //     accept: 'flowchart-node',
  //     drop: ({
  //       visualizer,
  //       id,
  //     }: {
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       visualizer: SandboxVisualizer<any, unknown> | null;
  //       id: string;
  //     }) => {
  //       if (visualizer === null) {
  //         return;
  //       }

  //       const visualizerInputs = visualizer?.accepts.shape.shape ?? [];

  //       const newNode = {
  //         id: `visualizer-${id}`,
  //         type: 'customFlow',
  //         data: {
  //           label: visualizer.name,
  //           inputs: Object.keys(visualizerInputs).map((param) => ({
  //             id: param,
  //             label: param,
  //             hasValue: false,
  //           })),
  //         },
  //       } satisfies FlowNode;

  //       setNodes((nds) => [...nds, newNode]);
  //     },
  //   };
  // });

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={20} className="p-4 flex flex-col items-stretch gap-2">
        <Heading variant="h2">Configure box</Heading>
        <ProblemSelect />
        <AlgorithmSelect />
        <Heading variant="h3">Visualizers</Heading>
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
              const getKey = (index: number): string => {
                const key = `visualizer-${index}`;
                if (visualizers.order.includes(key)) {
                  return getKey(index + 1);
                }
                return key;
              };
              const newKey = getKey(0);
              visualizers.appendAlias(newKey, value.key);
            }}
          />
        </HeadingContent>
        <Heading className="mt-4" variant="h3">
          Adapters
        </Heading>
        <HeadingContent>
          {Object.entries(selectedAdapters).map(([alias, option]) => (
            <div className="flex w-full items-end gap-2" key={alias}>
              <AdapterSelect
                className="flex-1"
                label={alias}
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
              const getKey = (index: number): string => {
                const key = `adapter-${index}`;
                if (
                  Object.keys(algorithmVisualizersTree.adapters ?? {}).includes(
                    key,
                  )
                ) {
                  return getKey(index + 1);
                }
                return key;
              };
              const newKey = getKey(0);
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
          className={clsx(
            String.raw`[&_.react-flow\_\_handle]:border-2`,
            String.raw`[&_.react-flow\_\_handle]:border-border [&_.react-flow\_\_handle]:relative`,
            String.raw`[&_.react-flow\_\_handle:hover]:bg-accent`,
            String.raw`[&_.react-flow\_\_handle]:w-4 [&_.react-flow\_\_handle]:h-4`,
            String.raw`[&_.react-flow\_\_handle]:translate-x-0 [&_.react-flow\_\_handle]:translate-y-0`,
            String.raw`[&_.react-flow\_\_handle]:inset-0`,
          )}
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
