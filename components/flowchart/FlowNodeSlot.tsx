import StyledObjectInspector from '@components/common/StyledObjectInspector';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { MaterialSymbol, Tooltip } from '@components/ui';
import CodeBlock from '@components/ui/CodeBlock';
import Dialog from '@components/ui/Dialog';
import Heading, { HeadingContent } from '@components/ui/Heading';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ZodError } from 'zod';

type FlowNodeSlotSide = 'start' | 'end';

export default function FlowNodeSlot({
  id,
  error: errorRaw,
  label,
  subLabel,
  value,
  valueType,
  hasValue,
  isUsingInputMainSlot,
  isConnected,
  side,
  isExecuting,
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
  isExecuting: boolean;
}) {
  const { flowchartMode } = useUserPreferences();
  const isMainSlot = id === '.';
  const shouldHighlightRaw = hasValue && (isMainSlot || !isUsingInputMainSlot);
  const isShadowedByMainSlot =
    !isMainSlot && isConnected && isUsingInputMainSlot;

  const [error, setError] = useState(errorRaw);
  const [shouldHighlight, setShouldHighlight] = useState(shouldHighlightRaw);
  const hasError = error !== null;

  useEffect(() => {
    if (!isExecuting) {
      setError(errorRaw);
      setShouldHighlight(shouldHighlightRaw);
    }
  }, [errorRaw, isExecuting, shouldHighlightRaw]);

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
        isConnectable={
          (!isConnected ||
            side === 'end' ||
            flowchartMode === 'intermediate') &&
          flowchartMode !== 'basic'
        }
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
              title={`Variable: ${label}`}
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
