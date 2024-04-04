import { Button, MaterialSymbol, ResizeHandle, Tooltip } from '@components/ui';
import { useBreakpoint } from '@utils/useBreakpoint';
import useOnScreen from '@utils/useOnScreen';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

export type PseudocodeProps = {
  pseudocode: string;
  startLine: number | undefined;
  endLine: number | undefined;
  tooltip: string | undefined;
  stepNumber: number;
  className?: string;
};

export default function Pseudocode({
  pseudocode,
  startLine,
  endLine,
  tooltip,
  stepNumber,
  className,
}: PseudocodeProps) {
  const root = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(root);
  const hasHighlight = startLine !== undefined && endLine !== undefined;
  const [showTooltip, setShowTooltip] = useState(true);

  // A hack so the tooltip will fade away when the next tooltip is undefined
  const [cachedTooltip, setCachedTooltip] = useState<string | undefined>(
    tooltip,
  );

  useEffect(() => {
    if (tooltip !== undefined) {
      setCachedTooltip(tooltip);
    }
  }, [stepNumber, tooltip]);

  const { isMd } = useBreakpoint('md');

  return (
    <div className={clsx(className, 'w-full h-full flex flex-col')} ref={root}>
      <PanelGroup direction="vertical" className="flex-1">
        {!isMd && (
          <>
            <Panel key="annotations">
              <div className="bg-surface h-full text-on-surface p-4">
                {tooltip && <span>{tooltip}</span>}
                {!tooltip && (
                  <span className="text-muted">
                    No annotation for current step
                  </span>
                )}
              </div>
            </Panel>
            <ResizeHandle orientation="horizontal" />
          </>
        )}
        <Panel key="pseudocode" defaultSize={80}>
          <div className="group relative text-xs overflow-x-hidden h-full">
            <div className="flex gap-1">
              {hasHighlight && (
                <Tooltip
                  zIndex={20}
                  constrainWidthToTrigger
                  side="bottom"
                  open={
                    tooltip !== undefined && showTooltip && isVisible && isMd
                  }
                  content={
                    <div className="py-2 flex gap-2 items-start">
                      <span>{tooltip ?? cachedTooltip}</span>
                      <Button
                        icon={<MaterialSymbol icon="visibility_off" />}
                        label="Hide"
                        hideLabel
                        size="sm"
                        variant="filled"
                        onClick={() => setShowTooltip(false)}
                      />
                    </div>
                  }
                >
                  <span
                    className="w-full bg-primary/30 absolute top-0 -z-10 transition-all rounded"
                    style={{
                      transform: `translateY(${startLine - 1}rem)`,
                      height: `${endLine - startLine + 1}rem`,
                    }}
                  />
                </Tooltip>
              )}
              <div className="flex flex-col transition-colors text-on-surface/30 group-hover:text-on-surface/80 items-end">
                {Array.from(
                  { length: pseudocode.split('\n').length },
                  (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ),
                )}
              </div>
              <pre className="flex flex-col overflow-x-auto">
                {pseudocode.split('\n').map((line, lineIndex) => {
                  const lineNumber = lineIndex + 1;
                  const highlighted =
                    startLine !== undefined &&
                    endLine !== undefined &&
                    startLine <= lineNumber &&
                    lineNumber <= endLine;
                  const blurred =
                    startLine !== undefined &&
                    endLine !== undefined &&
                    !highlighted;
                  return (
                    <code
                      className={clsx(
                        'transition-colors',
                        blurred &&
                          'text-on-surface/70 group-hover:text-on-surface',
                      )}
                      key={lineNumber}
                    >
                      {line}
                      {line.length === 0 && ' '}
                    </code>
                  );
                })}
              </pre>
            </div>
          </div>
        </Panel>
      </PanelGroup>
      <div className="p-2 hidden md:block">
        <Button
          icon={
            <MaterialSymbol
              icon={showTooltip ? 'visibility_off' : 'visibility'}
            />
          }
          variant="filled"
          label={showTooltip ? 'Hide annotations' : 'Show annotations'}
          onClick={() => setShowTooltip(!showTooltip)}
        />
      </div>
    </div>
  );
}
