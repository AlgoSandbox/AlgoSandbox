import { ErrorEntry } from '@app/errors';
import ErrorDisplay from '@components/common/ErrorDisplay';
import FlowchartAlgorithmSelect from '@components/flowchart/FlowchartAlgorithmSelect';
import FlowchartProblemSelect from '@components/flowchart/FlowchartProblemSelect';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Button, Input, MaterialSymbol } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import clsx from 'clsx';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  getConnectedEdges,
  NodeProps,
  NodeToolbar,
  Position,
  useNodeId,
  useStore,
} from 'reactflow';
import { ZodError } from 'zod';

import FlowchartAdapterSelect from './FlowchartAdapterSelect';
import FlowchartVisualizerSelect from './FlowchartVisualizerSelect';
import FlowNodeSlot from './FlowNodeSlot';

export type FlowNodeData = {
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
  name: string;
  onNameChange: (name: string) => void;
  evaluationError: Array<ErrorEntry> | null;
};

export type FlowNodeProps = NodeProps<FlowNodeData>;

const FlowNodeCard = forwardRef<HTMLDivElement, FlowNodeProps>(
  (
    {
      data: {
        inputs = [],
        outputs = [],
        type,
        alias,
        name,
        onNameChange,
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

    const [internalName, setInternalName] = useState(name);

    useEffect(() => {
      setInternalName(name);
    }, [name]);

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

    const [showRenameDialog, setShowRenameDialog] = useState(false);

    return (
      <>
        <Dialog
          title="Rename component"
          open={showRenameDialog}
          onOpenChange={setShowRenameDialog}
          content={
            <div className="flex flex-col gap-4 items-start">
              <Input
                label="Name"
                containerClassName="self-stretch"
                placeholder={alias}
                value={internalName}
                onChange={(e) => {
                  setInternalName(e.target.value);
                }}
              />
              <Button
                onClick={() => {
                  onNameChange(internalName);
                  setShowRenameDialog(false);
                }}
                disabled={internalName === name}
                variant="filled"
                label="Save"
              />
            </div>
          }
        />
        <NodeToolbar
          isVisible={selected && deletable}
          position={Position.Top}
          align="end"
          className="flex gap-2"
        >
          {alias !== 'algorithm' && alias !== 'problem' && (
            <Button
              icon={<MaterialSymbol icon="edit" />}
              label="Rename"
              variant="filled"
              size="sm"
              onClick={() => {
                setShowRenameDialog(true);
              }}
            />
          )}
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
            <span>{name || alias}</span>
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

export default FlowNodeCard;
