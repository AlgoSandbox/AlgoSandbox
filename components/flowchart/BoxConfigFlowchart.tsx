import 'reactflow/dist/style.css';

import { ErrorEntry } from '@app/errors';
import { useFlowchartCalculations } from '@app/playground/BoxPage';
import CatalogSelect from '@components/box-page/CatalogSelect';
import ErrorDisplay from '@components/common/ErrorDisplay';
import StyledObjectInspector from '@components/common/StyledObjectInspector';
import FlowchartAlgorithmSelect from '@components/flowchart/FlowchartAlgorithmSelect';
import FlowchartProblemSelect from '@components/flowchart/FlowchartProblemSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { useTab } from '@components/tab-manager/TabProvider';
import { Button, MaterialSymbol, Tooltip } from '@components/ui';
import CodeBlock from '@components/ui/Codeblock';
import Dialog from '@components/ui/Dialog';
import Heading, { HeadingContent } from '@components/ui/Heading';
import Dagre from '@dagrejs/dagre';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import getZodTypeName from '@utils/zod/getZodTypeName';
import stringifyZodType from '@utils/zod/stringifyZodType';
import clsx from 'clsx';
import { compact, uniqWith } from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  NodeProps,
  NodeToolbar,
  NodeTypes,
  Position,
  useNodeId,
  useStore,
} from 'reactflow';
import { SomeZodObject, ZodError } from 'zod';

import { useBoxContext } from '../box-page';
import FlowchartAdapterSelect from './FlowchartAdapterSelect';
import FlowchartVisualizerSelect from './FlowchartVisualizerSelect';

type FlowNodeData = {
  inputs?: Array<{
    id: string;
    label: string;
    subLabel?: string;
    valueType?: string;
    value?: unknown;
    hasValue: boolean;
    error: ZodError | null;
  }>;
  outputs?: Array<{
    id: string;
    label: string;
    subLabel?: string;
    valueType?: string;
    value?: unknown;
    hasValue: boolean;
  }>;
  alias: string;
  label: string;
  type: 'algorithm' | 'problem' | 'visualizer' | 'adapter';
  deletable: boolean;
  onDelete: () => void;
  evaluationError: Array<ErrorEntry> | null;
};

type FlowNodeProps = NodeProps<FlowNodeData>;

type FlowNode = Node<FlowNodeProps['data']>;

function getNodeHeight({ slotCount }: { slotCount: number }) {
  return 160 + slotCount * 32;
}

type FlowNodeSlotSide = 'start' | 'end';

function FlowNodeSlot({
  id,
  error,
  label,
  subLabel,
  value,
  valueType,
  hasValue,
  isUsingInputMainSlot,
  isConnected,
  side,
}: {
  id: string;
  label: string;
  subLabel?: string;
  value?: unknown;
  valueType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: ZodError<any> | null;
  hasValue: boolean;
  isUsingInputMainSlot: boolean;
  isConnected: boolean;
  side: FlowNodeSlotSide;
}) {
  const { flowchartMode } = useUserPreferences();
  const isMainSlot = id === '.';
  const hasError = error !== null;
  const shouldHighlight = hasValue && (isMainSlot || !isUsingInputMainSlot);
  const isShadowedByMainSlot =
    !isMainSlot && isConnected && isUsingInputMainSlot;

  const [showSlotDialog, setShowSlotDialog] = useState(false);

  return (
    <div
      key={`input-${id}`}
      className={clsx(
        'flex items-center',
        isMainSlot ? 'gap-1' : 'gap-3',
        side === 'end' && 'flex-row-reverse',
      )}
    >
      <Handle
        className={clsx(
          [
            side === 'start' && [
              isMainSlot ? '!w-6 !h-6 -ms-3' : '!w-4 !h-4 -ms-2',
            ],
            side === 'end' && [
              isMainSlot ? '!w-6 !h-6 -me-3' : '!w-4 !h-4 -me-2',
            ],
          ],
          hasError && '!bg-danger',
          !hasError && [
            isConnected && [
              shouldHighlight ? '!bg-accent' : '!bg-surface-high',
            ],
            !isConnected && '!bg-surface',
          ],
        )}
        type={side === 'start' ? 'target' : 'source'}
        position={side === 'start' ? Position.Left : Position.Right}
        id={id}
        isConnectable={!isConnected && flowchartMode === 'full'}
      />
      <div
        className={clsx(
          'flex flex-col',
          side === 'start' ? 'items-start' : 'items-end',
          'font-mono',
          hasError && 'text-danger',
          !hasError && [shouldHighlight ? 'text-on-surface' : 'text-muted'],
        )}
      >
        <span>{label}</span>
        {!isMainSlot && subLabel && (
          <>
            <button
              className="hover:bg-surface-high rounded text-sm flex px-1 gap-1 items-center border text-label"
              type="button"
              onClick={() => setShowSlotDialog(true)}
            >
              {subLabel}
              <MaterialSymbol icon="info" className="text-label !text-[16px]" />
            </button>
            <Dialog
              title={`Slot info: ${label}`}
              size="full"
              content={
                <div className="flex flex-col h-full gap-y-2">
                  <Heading variant="h4">Type</Heading>
                  <HeadingContent>
                    <CodeBlock code={valueType ?? ''} language="ts" />
                  </HeadingContent>
                  <Heading variant="h4">Current value</Heading>
                  <HeadingContent>
                    <div className="bg-surface">
                      <StyledObjectInspector data={value} />
                    </div>
                  </HeadingContent>
                </div>
              }
              open={showSlotDialog}
              onOpenChange={setShowSlotDialog}
            />
          </>
        )}
      </div>
      {hasError && (
        <Tooltip
          content={
            <div>
              <span className="text-lg">Errors:</span>
              <ul className="list-disc list-inside">
                {error
                  .flatten((issue) => ({
                    message: issue.message,
                    path: issue.path,
                  }))
                  .formErrors.map(({ path, message }) => (
                    <li key={path.join('.')}>{message}</li>
                  ))}
                {Object.entries(
                  error.flatten((issue) => ({
                    message: issue.message,
                    path: issue.path,
                  })).fieldErrors,
                ).map(([field, fieldErrors]) => (
                  <li key={field}>
                    <span className="font-mono">{field}:</span>
                    <ul className="list-disc list-inside ps-4">
                      {fieldErrors?.map(({ path, message }) => (
                        <li key={path.join('.')}>{message}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
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
      {isMainSlot && flowchartMode === 'full' && (
        <Tooltip
          content={
            <ul>
              <li>
                This slot represents the entire input.
                <br />
                Use this to conveniently fulfill the entire input with another
                node&apos;s output.
              </li>
              <br />
              <li>
                Slot value type:
                <pre>{valueType}</pre>
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

const FlowNodeCard = forwardRef<HTMLDivElement, FlowNodeProps>(
  (
    {
      data: {
        inputs = [],
        outputs = [],
        type,
        alias,
        onDelete,
        deletable,
        evaluationError,
      },
      selected,
    },
    ref,
  ) => {
    const { flowchartMode } = useUserPreferences();
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
      (edge) => edge.target === nodeId && edge.targetHandle === '.',
    );

    function createLeftSlot({
      id,
      error,
      label,
      subLabel,
      hasValue,
      value,
      valueType,
    }: {
      id: string;
      label: string;
      subLabel?: string;
      valueType?: string;
      value?: unknown;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: ZodError<any> | null;
      hasValue: boolean;
    }) {
      const isConnected = connectedEdges.some(
        (edge) => edge.target === nodeId && edge.targetHandle === id,
      );

      return (
        <FlowNodeSlot
          id={id}
          label={label}
          subLabel={subLabel}
          value={value}
          valueType={valueType}
          error={error}
          hasValue={hasValue}
          isUsingInputMainSlot={isUsingInputMainSlot}
          isConnected={isConnected}
          side="start"
        />
      );
    }

    function createRightSlot({
      id,
      label,
      subLabel,
      hasValue,
      value,
      valueType,
    }: {
      id: string;
      label: string;
      subLabel?: string;
      hasValue: boolean;
      value?: unknown;
      valueType?: string;
    }) {
      const isConnected = connectedEdges.some(
        (edge) => edge.source === nodeId && edge.sourceHandle === id,
      );

      return (
        <FlowNodeSlot
          id={id}
          label={label}
          subLabel={subLabel}
          value={value}
          valueType={valueType}
          error={null}
          hasValue={hasValue}
          isUsingInputMainSlot={false}
          isConnected={isConnected}
          side="end"
        />
      );
    }

    const mainInputSlot = inputs.find(({ id }) => id === '.');
    const mainOutputSlot = outputs.find(({ id }) => id === '.');

    return (
      <>
        <NodeToolbar
          isVisible={selected && deletable}
          position={Position.Top}
          align="end"
        >
          <Button
            icon={<MaterialSymbol icon="delete" />}
            label="Delete"
            variant="filled"
            size="sm"
            onClick={onDelete}
          />
        </NodeToolbar>
        <div
          className={clsx(
            'border-2 relative min-w-[500px] flex flex-col items-stretch rounded bg-surface',
            evaluationError === null &&
              String.raw`[.react-flow\_\_node.selected>&]:border-accent`,
            evaluationError !== null &&
              String.raw`[.react-flow\_\_node>&]:border-danger`,
            'transition-colors',
          )}
          ref={ref}
        >
          <div className="absolute -top-1 -translate-y-full text-label text-lg">
            <span>{alias}</span>
          </div>
          <div className="p-2 border-b">
            {type === 'problem' && (
              <FlowchartProblemSelect hideErrors hideLabel className="flex-1" />
            )}
            {type === 'algorithm' && (
              <FlowchartAlgorithmSelect hideErrors hideLabel />
            )}
            {type === 'visualizer' && (
              <FlowchartVisualizerSelect alias={alias} />
            )}
            {type === 'adapter' && (
              <FlowchartAdapterSelect
                className="flex-1"
                alias={alias}
                label={alias}
              />
            )}
          </div>
          {evaluationError !== null && (
            <ErrorDisplay errors={evaluationError} />
          )}
          <div className="flex justify-between items-center text-lg font-semibold py-2">
            {mainInputSlot ? createLeftSlot(mainInputSlot) : <div />}
            {mainOutputSlot ? createRightSlot(mainOutputSlot) : <div />}
          </div>
          {flowchartMode === 'full' && (
            <div className="flex justify-between py-2">
              <div className="flex flex-col gap-2">
                {inputs
                  .filter(({ id }) => id !== '.')
                  .map((slot) => {
                    return createLeftSlot(slot);
                  })}
              </div>
              <div className="flex flex-col items-end gap-2">
                {outputs
                  .filter(({ id }) => id !== '.')
                  .map((slot) => {
                    return createRightSlot(slot);
                  })}
              </div>
            </div>
          )}
        </div>
      </>
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
  const problem = useBoxContext('problem.instance');
  const { reset, isBoxDirty } = useBoxContext();
  const { visualizerOptions, adapterOptions } = useSandboxComponents();
  const { setFlowchartMode, flowchartMode } = useUserPreferences();

  const configEvaluated = useBoxContext('config.evaluated');

  const setConfig = useBoxContext('config.set');
  const configTree = useBoxContext('config.tree');

  const visualizers = useBoxContext('visualizers');
  const visualizerInstances = useBoxContext('visualizers.instances');

  const algorithmName = algorithm.unwrapOr(null)?.name ?? 'Untitled algorithm';
  const problemName = problem.unwrapOr(null)?.name ?? 'Untitled problem';

  const componentOptions = useMemo(() => {
    return groupOptionsByTag([...visualizerOptions, ...adapterOptions]);
  }, [visualizerOptions, adapterOptions]);

  useEffect(() => {
    const newTabName = 'Config';
    if (tabName !== newTabName) {
      renameTab(tabId, newTabName);
    }
  }, [boxName, renameTab, tabId, tabName]);

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
        setConfig({
          adapters: configTree.adapters,
          composition: {
            ...configTree.composition,
            connections: configTree.composition.connections.filter(
              ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
            ),
          },
        });
      }
    },
    [configTree.adapters, configTree.composition, setConfig, visualizers],
  );

  const initialAdapterNodes = useMemo(
    () =>
      Object.entries(configEvaluated.adapterInstances ?? {}).map(
        ([alias, evaluation]) => {
          const { value: adapter, name } =
            evaluation.mapLeft(() => null).value ?? {};
          const evaluationError = evaluation.mapRight(() => null).value;
          const inputSlots = Object.keys(adapter?.accepts.shape.shape ?? {});
          const outputSlots = Object.keys(adapter?.outputs.shape.shape ?? {});
          const slotCount = Math.max(inputSlots.length, outputSlots.length);

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
              label: name ?? alias,
              deletable: flowchartMode === 'full',
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
    [
      configEvaluated.adapterInstances,
      flowchartMode,
      inputErrors,
      inputs,
      onNodeDelete,
      outputs,
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
  }, [flowchartMode, inputErrors, inputs, onNodeDelete, visualizerInstances]);

  const initialNodes = useMemo(() => {
    const problemOutputSlots = Object.keys(problemOutputs);
    const problemSlotCount = problemOutputSlots.length;

    const algorithmInputSlots = Object.keys(algorithmInputs);
    const algorithmOutputSlots = Object.keys(algorithmOutputs);
    const algorithmSlotCount = Math.max(
      algorithmInputSlots.length,
      algorithmOutputSlots.length,
    );

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
          outputs: ['.', ...algorithmOutputSlots].map((param) => {
            return makeSlot({
              values: outputs['algorithm'],
              errors: undefined,
              param,
              shape: algorithm.unwrapOr(null)?.outputs.shape,
            });
          }),
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
    initialAdapterNodes,
    initialVisualizerNodes,
    inputErrors,
    inputs,
    outputs,
    problem,
    problemName,
    problemOutputs,
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
      <div className="absolute bottom-4 md:bottom-auto end-4 md:end-auto md:top-4 mx-auto flex flex-col items-end md:flex-row gap-2 md:items-center">
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
