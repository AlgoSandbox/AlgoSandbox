import 'reactflow/dist/style.css';

import { BoxConfigTree } from '@algo-sandbox/core';
import { useFlowchartCalculations } from '@app/playground/BoxPage';
import CatalogSelect from '@components/box-page/CatalogSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { useTab } from '@components/tab-manager/TabProvider';
import { Button, MaterialSymbol } from '@components/ui';
import Dagre from '@dagrejs/dagre';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import { getBoxConfigNodeOrder } from '@utils/solveFlowchart';
import getZodTypeName from '@utils/zod/getZodTypeName';
import stringifyZodType from '@utils/zod/stringifyZodType';
import clsx from 'clsx';
import { compact, uniqWith } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  NodeTypes,
} from 'reactflow';
import { toast } from 'sonner';
import { SomeZodObject, ZodError } from 'zod';

import { useBoxContext, useBoxControlsContext } from '../box-page';
import FlowNodeCard, { FlowNodeData, FlowNodeProps } from './FlowNodeCard';

type FlowNode = Node<FlowNodeProps['data']>;

function getNodeHeight({ slotCount }: { slotCount: number }) {
  return 160 + slotCount * 90;
}

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
  // nodesep = vertical distance, ranksep = horizontal distance
  g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 128 });

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

function makeSlot({
  values,
  errors,
  param,
  shape,
}: {
  values: Record<string, unknown> | undefined;
  errors: Record<string, ZodError> | undefined;
  param: string;
  shape: SomeZodObject | undefined;
}) {
  const label = (() => {
    if (param === '.') {
      return '';
    }

    return param;
  })();

  const subLabel = (() => {
    if (param === '.') {
      return undefined;
    }

    if (shape === undefined) {
      return 'unknown type';
    }

    return getZodTypeName(shape.shape[param]);
  })();

  // stirngifed zdotype
  const valueType = (() => {
    if (shape === undefined) {
      return undefined;
    }

    if (param === '.') {
      return stringifyZodType(shape);
    }

    return stringifyZodType(shape.shape[param]);
  })();

  const value = (() => {
    if (param === '.') {
      return values;
    }

    return values?.[param];
  })();

  const hasValue = (() => {
    if (param === '.') {
      return values !== undefined;
    }

    return Object.hasOwn(values ?? {}, param);
  })();

  return {
    id: param,
    label,
    subLabel,
    value,
    valueType,
    hasValue,
    error: errors?.[param] ?? null,
  };
}

export default function BoxConfigFlowchart({ tabId }: { tabId: string }) {
  const {
    inputs,
    outputs,
    inputErrors: inputErrorsRaw,
  } = useFlowchartCalculations();
  const { label: tabName } = useTab();
  const { renameTab } = useTabManager();
  const boxName = useBoxContext('boxName.value');
  const algorithm = useBoxContext('algorithm.instance');
  const problem = useBoxContext('problem.instance');
  const { reset: resetRaw, isBoxDirty } = useBoxContext();
  const { visualizerOptions, adapterOptions } = useSandboxComponents();
  const { setFlowchartMode, flowchartMode } = useUserPreferences();
  const { isExecuting } = useBoxControlsContext();

  const configEvaluated = useBoxContext('config.evaluated');

  const setConfigRaw = useBoxContext('config.set');
  const configTree = useBoxContext('config.tree');
  const componentNames = useBoxContext('componentNames');
  const setComponentNames = useBoxContext('setComponentNames');

  const visualizers = useBoxContext('visualizers');
  const visualizerInstances = useBoxContext('visualizers.instances');

  const algorithmName = algorithm.unwrapOr(null)?.name ?? 'Untitled algorithm';
  const problemName = problem.unwrapOr(null)?.name ?? 'Untitled problem';

  const nodeOrder = useMemo(() => {
    return getBoxConfigNodeOrder(configTree);
  }, [configTree]);

  const componentOptions = useMemo(() => {
    return groupOptionsByTag([...visualizerOptions, ...adapterOptions]);
  }, [visualizerOptions, adapterOptions]);

  const [configUndoStack, setConfigUndoStack] = useState<BoxConfigTree[]>([]);

  const isAliasAfterAlgorithm = useCallback(
    (alias: string) => {
      return nodeOrder.indexOf('algorithm') < nodeOrder.indexOf(alias);
    },
    [nodeOrder],
  );

  const setConfig = useCallback(
    (value: BoxConfigTree) => {
      setConfigRaw(value);
      setConfigUndoStack((prev) => [...prev, configTree]);
    },
    [configTree, setConfigRaw],
  );

  const reset = useCallback(() => {
    resetRaw();
    setConfigUndoStack((prev) => [...prev, configTree]);
  }, [configTree, resetRaw]);

  const undo = useCallback(() => {
    if (configUndoStack.length === 0) {
      toast.error('Nothing to undo');
      return;
    }

    const currentConfig = configTree;
    const newStack = [...configUndoStack];
    const newConfig = newStack.pop();
    setConfig(newConfig!);
    setConfigUndoStack(newStack);

    toast.info('Undo successful', {
      action: {
        label: 'Redo',
        onClick: () => {
          setConfig(currentConfig);
          setConfigUndoStack(configUndoStack);
        },
      },
    });
  }, [configTree, configUndoStack, setConfig]);

  useEffect(() => {
    const newTabName = 'Config';
    if (tabName !== newTabName) {
      renameTab(tabId, newTabName);
    }
  }, [boxName, renameTab, tabId, tabName]);

  const inputErrors = useMemo(() => {
    // Don't show error when still executing
    if (isExecuting) {
      return {};
    }

    return inputErrorsRaw;
  }, [inputErrorsRaw, isExecuting]);

  const algorithmInputs = useMemo(
    () => algorithm.unwrapOr(null)?.accepts.shape.shape ?? {},
    [algorithm],
  );

  const algorithmOutputs = useMemo(
    () => algorithm.unwrapOr(null)?.outputs.shape.shape ?? {},
    [algorithm],
  );

  const problemOutputs = useMemo(
    () => problem.unwrapOr(null)?.type.shape.shape ?? {},
    [problem],
  );

  const onNodeDelete = useCallback(
    (type: FlowNode['data']['type'], alias: string) => {
      if (type === 'adapter') {
        setConfig({
          adapters: Object.fromEntries(
            Object.entries(configTree.adapters ?? {}).filter(
              ([key]) => key !== alias,
            ),
          ),
          composition: {
            ...configTree.composition,
            connections: configTree.composition.connections.filter(
              ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
            ),
          },
        });
      } else if (type === 'visualizer') {
        visualizers.removeAlias(alias);
      }
    },
    [configTree.adapters, configTree.composition, setConfig, visualizers],
  );

  const initialAdapterNodes = useMemo(
    () =>
      compact(
        Object.entries(configEvaluated.adapterInstances ?? {}).map(
          ([alias, evaluation]) => {
            const { value: adapter } =
              evaluation.mapLeft(() => null).value ?? {};
            const evaluationError = evaluation.mapRight(() => null).value;
            const inputSlots = Object.keys(adapter?.accepts.shape.shape ?? {});
            const outputSlots = Object.keys(adapter?.outputs.shape.shape ?? {});
            const slotCount = Math.max(inputSlots.length, outputSlots.length);

            if (flowchartMode === 'simple' && isAliasAfterAlgorithm(alias)) {
              return null;
            }

            return {
              id: alias,
              type: 'customFlow',
              width: 500,
              height: getNodeHeight({
                slotCount,
              }),
              deletable: flowchartMode === 'full',
              data: {
                alias,
                type: 'adapter',
                label: alias,
                deletable: flowchartMode === 'full',
                name: componentNames[alias] ?? '',
                onNameChange: (name: string) => {
                  setComponentNames({
                    ...componentNames,
                    [alias]: name,
                  });
                },
                onDelete: () => {
                  onNodeDelete('adapter', alias);
                },
                evaluationError,
                inputs: ['.', ...inputSlots].map((param) => {
                  return makeSlot({
                    values: inputs[alias],
                    errors: inputErrors[alias],
                    param,
                    shape: adapter?.accepts.shape,
                  });
                }),
                outputs: ['.', ...outputSlots].map((param) => {
                  return makeSlot({
                    values: outputs[alias],
                    errors: undefined,
                    param,
                    shape: adapter?.outputs.shape,
                  });
                }),
              },
            } satisfies Omit<FlowNode, 'position'>;
          },
        ),
      ),
    [
      componentNames,
      configEvaluated.adapterInstances,
      flowchartMode,
      inputErrors,
      inputs,
      isAliasAfterAlgorithm,
      onNodeDelete,
      outputs,
      setComponentNames,
    ],
  );

  const initialVisualizerNodes = useMemo(() => {
    return compact(
      Object.entries(visualizerInstances).map(([alias, evaluation]) => {
        const { value: instance, name } =
          evaluation.mapLeft(() => null).value ?? {};
        const evaluationError = evaluation.mapRight(() => null).value;
        const visualizerInputs = instance?.accepts.shape.shape ?? {};
        const inputSlots = Object.keys(visualizerInputs);

        if (flowchartMode === 'simple' && isAliasAfterAlgorithm(alias)) {
          return null;
        }

        return {
          id: alias,
          type: 'customFlow',
          width: 500,
          height: getNodeHeight({
            slotCount: inputSlots.length,
          }),
          deletable: flowchartMode === 'full',
          data: {
            type: 'visualizer',
            alias,
            label: name ?? alias,
            name: componentNames[alias] ?? '',
            onNameChange: (name: string) => {
              setComponentNames({
                ...componentNames,
                [alias]: name,
              });
            },
            onDelete: () => {
              onNodeDelete('visualizer', alias);
            },
            deletable: flowchartMode === 'full',
            evaluationError,
            inputs: ['.', ...inputSlots].map((param) => {
              return makeSlot({
                values: inputs[alias],
                errors: inputErrors[alias],
                param,
                shape: instance?.accepts.shape,
              });
            }),
          },
        } satisfies Omit<FlowNode, 'position'>;
      }),
    );
  }, [
    componentNames,
    flowchartMode,
    inputErrors,
    inputs,
    isAliasAfterAlgorithm,
    onNodeDelete,
    setComponentNames,
    visualizerInstances,
  ]);

  const initialNodes = useMemo(() => {
    const problemOutputSlots = Object.keys(problemOutputs);
    const problemSlotCount = problemOutputSlots.length;

    const algorithmInputSlots = Object.keys(algorithmInputs);
    const algorithmOutputSlots = Object.keys(algorithmOutputs);
    const algorithmSlotCount = Math.max(
      algorithmInputSlots.length,
      algorithmOutputSlots.length,
    );

    const hideOutputs = flowchartMode === 'simple';

    const nodeOutputs: FlowNodeData['outputs'] = (() => {
      if (hideOutputs) {
        return [];
      }

      return ['.', ...algorithmOutputSlots].map((param) => {
        return makeSlot({
          values: outputs['algorithm'],
          errors: undefined,
          param,
          shape: algorithm.unwrapOr(null)?.outputs.shape,
        });
      });
    })();

    return [
      {
        id: 'algorithm',
        type: 'customFlow',
        width: 500,
        height: getNodeHeight({
          slotCount: algorithmSlotCount,
        }),
        deletable: false,
        data: {
          type: 'algorithm',
          alias: 'algorithm',
          label: algorithmName,
          name: componentNames['algorithm'] ?? '',
          onNameChange: (name: string) => {
            setComponentNames({
              ...componentNames,
              algorithm: name,
            });
          },
          onDelete: () => {},
          deletable: false,
          evaluationError: algorithm.mapRight(() => null).value,
          inputs: ['.', ...algorithmInputSlots].map((param) => {
            return makeSlot({
              values: inputs['algorithm'],
              errors: inputErrors['algorithm'],
              param,
              shape: algorithm.unwrapOr(null)?.accepts.shape,
            });
          }),
          outputs: nodeOutputs,
        },
      },
      {
        id: 'problem',
        type: 'customFlow',
        width: 500,
        height: getNodeHeight({
          slotCount: problemSlotCount,
        }),
        deletable: false,
        data: {
          type: 'problem',
          alias: 'problem',
          label: problemName,
          name: componentNames['problem'] ?? '',
          onNameChange: (name: string) => {
            setComponentNames({
              ...componentNames,
              problem: name,
            });
          },
          onDelete: () => {},
          deletable: false,
          evaluationError: problem.mapRight(() => null).value,
          outputs: ['.', ...problemOutputSlots].map((param) => {
            return makeSlot({
              values: outputs['problem'],
              errors: undefined,
              param,
              shape: problem.unwrapOr(null)?.type.shape,
            });
          }),
        },
      },
      ...initialAdapterNodes,
      ...initialVisualizerNodes,
    ] satisfies Array<Omit<FlowNode, 'position'>>;
  }, [
    algorithm,
    algorithmInputs,
    algorithmName,
    algorithmOutputs,
    componentNames,
    flowchartMode,
    initialAdapterNodes,
    initialVisualizerNodes,
    inputErrors,
    inputs,
    outputs,
    problem,
    problemName,
    problemOutputs,
    setComponentNames,
  ]);

  const initialEdges = useMemo(() => {
    // Return a fake edge if in simple mode
    const connections = (() => {
      if (flowchartMode === 'simple') {
        const connections = configEvaluated.composition.connections.map(
          ({ fromKey, toKey }) => ({
            fromKey,
            fromSlot: '.',
            toKey,
            toSlot: '.',
          }),
        );

        return uniqWith(connections, (a, b) => {
          return a.fromKey === b.fromKey && a.toKey === b.toKey;
        });
      }

      return configEvaluated.composition.connections;
    })();

    const nodesUsingInputMainSlot = connections
      .filter(({ toSlot }) => toSlot === '.')
      .map(({ toKey }) => toKey);

    return connections.map(({ fromKey, fromSlot, toKey, toSlot }) => {
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
          !isActive && String.raw`[&>.react-flow\_\_edge-path]:!stroke-border`,
          String.raw`[&.selected.react-flow\_\_edge>.react-flow\_\_edge-path]:!stroke-accent [&.selected.react-flow\_\_edge>.react-flow\_\_edge-path]:!stroke-[4px]`,
        ]),
        animated: isActive,
        deletable: flowchartMode === 'full',
      };
    }) as Array<Edge>;
  }, [configEvaluated.composition.connections, flowchartMode, outputs]);

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

  const onNodesDelete = useCallback(
    (nodesToDelete: Array<FlowNode>) => {
      nodesToDelete.forEach(({ data: { alias, type } }) =>
        onNodeDelete(type, alias),
      );
    },
    [onNodeDelete],
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Array<Edge>) => {
      setConfig({
        ...configTree,
        composition: {
          ...configTree.composition,
          connections: configTree.composition.connections.filter(
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
    [configTree, setConfig],
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

      setConfig({
        ...configTree,
        composition: {
          ...configTree.composition,
          connections: [
            ...configTree.composition.connections,
            { fromKey, fromSlot, toKey, toSlot },
          ],
        },
      });
    },
    [configTree, setConfig],
  );

  useHotkeys(
    ['meta+z', 'ctrl+z'],
    (e) => {
      e.preventDefault();
      undo();
    },
    [undo],
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center">
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
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        fitView={true}
      >
        <Background className="bg-canvas" />
      </ReactFlow>
      <div className="absolute top-4 start-4 flex gap-2">
        <Button
          label="Simple"
          role="checkbox"
          variant="filled"
          selected={flowchartMode === 'simple'}
          onClick={() => {
            setFlowchartMode('simple');
          }}
        />
        <Button
          label="Full"
          role="checkbox"
          variant="filled"
          selected={flowchartMode === 'full'}
          onClick={() => {
            setFlowchartMode('full');
          }}
        />
      </div>
      <div
        className={clsx(
          'absolute mx-auto flex-col items-end gap-2',
          'bottom-4 xl:bottom-auto end-4 xl:end-auto xl:top-4',
          'flex xl:flex-row xl:items-center',
        )}
      >
        {flowchartMode === 'full' && (
          <CatalogSelect
            label="Add component"
            hideLabel
            options={componentOptions}
            placeholder="Add component"
            value={undefined}
            onChange={(value) => {
              if (value === null) {
                return;
              }

              if (
                visualizerOptions.some(
                  (option) => option.value.key === value.value.key,
                )
              ) {
                const getKey = (index: number): string => {
                  const key = `visualizer-${index}`;
                  if (visualizers.order.includes(key)) {
                    return getKey(index + 1);
                  }
                  return key;
                };
                const newKey = getKey(0);
                visualizers.appendAlias(newKey, value.value.key);
              } else if (
                adapterOptions.some(
                  (option) => option.value.key === value.value.key,
                )
              ) {
                const getKey = (index: number): string => {
                  const key = `adapter-${index}`;
                  if (Object.keys(configTree.adapters ?? {}).includes(key)) {
                    return getKey(index + 1);
                  }
                  return key;
                };
                const newKey = getKey(0);
                setConfig({
                  ...configTree,
                  adapters: {
                    ...configTree.adapters,
                    [newKey]: value.value.key,
                  },
                });
              }
            }}
          />
        )}
        <Button
          label="Auto layout"
          variant="filled"
          onClick={autoLayoutNodes}
          icon={<MaterialSymbol icon="mitre" />}
        />
        <Button
          label="Reset box config"
          variant="filled"
          onClick={reset}
          icon={<MaterialSymbol icon="settings_backup_restore" />}
          disabled={!isBoxDirty}
        />
      </div>
    </div>
  );
}
