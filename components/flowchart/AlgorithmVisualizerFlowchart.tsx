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
import clsx from 'clsx';
import { compact } from 'lodash';
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

    const isUsingInputMainSlot = connectedEdges.some(
      (edge) => edge.sourceHandle === '.',
    );

    function createLeftSlot({
      id,
      error,
      label,
      hasValue,
    }: {
      id: string;
      label: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: ZodError<any> | null;
      hasValue: boolean;
    }) {
      const isMainSlot = id === '.';
      const isConnected = connectedEdges.some(
        (edge) => edge.target === nodeId && edge.targetHandle === id,
      );
      const hasError = error !== null;
      const shouldHighlight = hasValue && (isMainSlot || !isUsingInputMainSlot);
      const isShadowedByMainSlot = !isMainSlot && isUsingInputMainSlot;

      return (
        <div
          key={id}
          className={clsx(
            'flex items-center gap-2',
            isMainSlot ? 'gap-2' : 'gap-3',
          )}
        >
          <Handle
            className={clsx(
              isMainSlot ? '!w-6 !h-6 -ms-3' : '!w-4 !h-4 -ms-2',
              hasError && '!bg-danger',
              !hasError && [
                isConnected && [
                  shouldHighlight ? '!bg-accent' : '!bg-surface-high',
                ],
                !isConnected && '!bg-surface',
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
              !hasError && [shouldHighlight ? 'text-on-surface' : 'text-muted'],
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
          {isShadowedByMainSlot && (
            <Tooltip
              content={
                <ul>
                  <li>This input is shadowed by the main input slot</li>
                </ul>
              }
            >
              <MaterialSymbol icon="info" className="text-label" />
            </Tooltip>
          )}
          {isMainSlot && (
            <Tooltip
              content={
                <ul>
                  <li>
                    This slot represents the entire input.
                    <br />
                    Use this to conveniently fulfill the entire input with
                    another node&apos;s output.
                  </li>
                </ul>
              }
            >
              <MaterialSymbol icon="info" className="text-label" />
            </Tooltip>
          )}
        </div>
      );
    }

    function createRightSlot({
      id,
      label,
      hasValue,
    }: {
      id: string;
      label: string;
      hasValue: boolean;
    }) {
      const isMainSlot = id === '.';
      const isConnected = connectedEdges.some(
        (edge) => edge.source === nodeId && edge.sourceHandle === id,
      );

      return (
        <div
          key={id}
          className={clsx('flex items-center', isMainSlot ? 'gap-2' : 'gap-3')}
        >
          {isMainSlot && (
            <Tooltip
              content={
                <ul>
                  <li>
                    This slot represents the entire output.
                    <br />
                    Use this to conveniently pass the entire output to another
                    node.
                  </li>
                </ul>
              }
            >
              <MaterialSymbol icon="info" className="text-label" />
            </Tooltip>
          )}
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
              isMainSlot ? '!w-6 !h-6 -me-3' : '!w-4 !h-4 -me-2',
              isConnected && [hasValue ? '!bg-accent' : '!bg-surface-high'],
              !isConnected && '!bg-surface',
            )}
            type="source"
            position={Position.Right}
            id={id}
          />
        </div>
      );
    }

    const mainInputSlot = inputs.find(({ id }) => id === '.');
    const mainOutputSlot = outputs.find(({ id }) => id === '.');

    return (
      <div
        className={clsx(
          'border relative h-[200px] w-[500px] flex flex-col items-stretch rounded bg-surface-high',
        )}
        ref={ref}
      >
        <div className="flex justify-between items-center text-lg font-semibold border-b py-2">
          {mainInputSlot ? createLeftSlot(mainInputSlot) : <div />}
          {label}
          {mainOutputSlot ? createRightSlot(mainOutputSlot) : <div />}
        </div>
        <div className="flex justify-between py-2">
          <div className="flex flex-col gap-2 absolute start-0">
            {inputs
              .filter(({ id }) => id !== '.')
              .map(({ id, label, hasValue, error }) => {
                return createLeftSlot({ id, error, hasValue, label });
              })}
          </div>
          <div className="flex flex-col items-end gap-2 absolute end-0">
            {outputs
              .filter(({ id }) => id !== '.')
              .map(({ id, label, hasValue }) => {
                return createRightSlot({ id, label, hasValue });
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
  const visualizerInstances = useBoxContext('visualizers.instances');

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
                inputs: ['.', ...Object.keys(adapter.accepts.shape.shape)].map(
                  (param) => {
                    const label = (() => {
                      if (param === '.') {
                        return 'input';
                      }

                      return param;
                    })();

                    const hasValue = (() => {
                      if (param === '.') {
                        return inputs[alias] !== undefined;
                      }

                      return Object.hasOwn(inputs[alias] ?? {}, param);
                    })();

                    return {
                      id: param,
                      label,
                      hasValue,
                      error: inputErrors[alias]?.[param] ?? null,
                    };
                  },
                ),
                outputs: ['.', ...Object.keys(adapter.outputs.shape.shape)].map(
                  (param) => {
                    const label = (() => {
                      if (param === '.') {
                        return 'output';
                      }

                      return param;
                    })();

                    const hasValue = (() => {
                      if (param === '.') {
                        return outputs[alias] !== undefined;
                      }

                      return Object.hasOwn(outputs[alias] ?? {}, param);
                    })();

                    return {
                      id: param,
                      label,
                      hasValue,
                    };
                  },
                ),
              },
            }) satisfies Omit<FlowNode, 'position'>,
        ),
    [algorithmVisualizersEvaluated.adapters, inputErrors, inputs, outputs],
  );

  const initialVisualizerNodes = useMemo(() => {
    return compact(
      Object.entries(visualizerInstances).map(([alias, evaluation]) => {
        if (evaluation === undefined) {
          return null;
        }

        const { value: instance, name } = evaluation;
        const visualizerInputs = instance?.accepts.shape.shape ?? {};

        return {
          id: alias,
          type: 'customFlow',
          width: 500,
          height: 200,
          data: {
            label: name,
            inputs: ['.', ...Object.keys(visualizerInputs)].map((param) => {
              const hasValue = (() => {
                if (param === '.') {
                  return inputs[alias] !== undefined;
                }

                return Object.hasOwn(inputs[alias] ?? {}, param);
              })();

              const label = (() => {
                if (param === '.') {
                  return 'input';
                }

                return param;
              })();

              return {
                id: param,
                label,
                hasValue,
                error: inputErrors[alias]?.[param] ?? null,
              };
            }),
          },
        } satisfies Omit<FlowNode, 'position'>;
      }),
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
            outputs: ['.', ...Object.keys(algorithmOutputs)].map((param) => {
              const hasValue = (() => {
                if (param === '.') {
                  return outputs['algorithm'] !== undefined;
                }
                return Object.hasOwn(outputs['algorithm'] ?? {}, param);
              })();

              const label = (() => {
                if (param === '.') {
                  return 'output';
                }

                return param;
              })();

              return {
                id: param,
                label,
                // TODO: Determine if algo is valid
                hasValue,
              };
            }),
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
    const nodesUsingInputMainSlot =
      algorithmVisualizersEvaluated.composition.connections
        .filter(({ toSlot }) => toSlot === '.')
        .map(({ toKey }) => toKey);

    return algorithmVisualizersEvaluated.composition.connections.map(
      ({ fromKey, fromSlot, toKey, toSlot }) => {
        const hasValue = (() => {
          if (fromSlot === '.') {
            return true;
          }
          return Object.hasOwn(outputs[fromKey] ?? {}, fromSlot);
        })();

        const isShadowedByMainSlot =
          toSlot !== '.' && nodesUsingInputMainSlot.includes(toKey);
        const isActive = hasValue && !isShadowedByMainSlot;

        return {
          id: `${fromKey}-${fromSlot}-${toKey}-${toSlot}`,
          source: fromKey,
          sourceHandle: fromSlot,
          target: toKey,
          targetHandle: toSlot,
          className: clsx([
            // Using String.raw to avoid escaping behaviour when using \_\_
            // See: https://github.com/tailwindlabs/tailwindcss/issues/8881
            String.raw`[&_.react-flow\_\_edge-path]:transition-colors`,
            String.raw`[&_.react-flow\_\_edge-path]:stroke-2 [&_.react-flow\_\_edge-path]:hover:!stroke-[4px]`,
            isActive && String.raw`[&>.react-flow\_\_edge-path]:!stroke-label`,
            !isActive &&
              String.raw`[&>.react-flow\_\_edge-path]:!stroke-border`,
            String.raw`[&.selected.react-flow\_\_edge>.react-flow\_\_edge-path]:!stroke-accent [&.selected.react-flow\_\_edge>.react-flow\_\_edge-path]:!stroke-[4px]`,
          ]),
          animated: isActive,
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
