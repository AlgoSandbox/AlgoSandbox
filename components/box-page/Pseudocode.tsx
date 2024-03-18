import { Button, Heading, MaterialSymbol, Tooltip } from '@components/ui';
import clsx from 'clsx';
import { RefObject, useEffect, useRef, useState } from 'react';

function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    observer.current = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (ref.current) observer.current?.observe(ref.current);
    return () => observer.current?.disconnect();
  }, [observer, ref]);

  return isIntersecting;
}

export type PseudocodeProps = {
  pseudocode: string;
  startLine: number | undefined;
  endLine: number | undefined;
  tooltip: string | undefined;
  stepNumber: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export default function Pseudocode({
  pseudocode,
  startLine,
  endLine,
  tooltip,
  stepNumber,
  hasPrevious,
  onPrevious,
  hasNext,
  onNext,
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
  const [cachedStepNumber, setCachedStepNumber] = useState<number>(stepNumber);

  useEffect(() => {
    if (tooltip !== undefined) {
      setCachedTooltip(tooltip);
      setCachedStepNumber(stepNumber);
    }
  }, [stepNumber, tooltip]);

  return (
    <div className={className} ref={root}>
      <div className="p-2">
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
      <div className="group relative text-xs overflow-x-hidden">
        <div className="flex gap-1">
          {hasHighlight && (
            <Tooltip
              side="bottom"
              open={tooltip !== undefined && showTooltip && isVisible}
              content={
                <div className="space-y-4 py-2 w-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <Heading variant="h4">
                      Step{' '}
                      {tooltip !== undefined ? stepNumber : cachedStepNumber}
                    </Heading>
                    <Button
                      icon={<MaterialSymbol icon="close" />}
                      label="Hide annotations"
                      onClick={() => setShowTooltip(false)}
                      hideLabel
                    />
                  </div>
                  <span>{tooltip ?? cachedTooltip}</span>
                  <div className="flex justify-between">
                    <Button
                      icon={<MaterialSymbol icon="arrow_back" />}
                      label="Previous"
                      variant="filled"
                      onClick={onPrevious}
                      disabled={!hasPrevious}
                      hideLabel
                    />
                    <Button
                      icon={<MaterialSymbol icon="arrow_forward" />}
                      label="Next"
                      variant="filled"
                      onClick={onNext}
                      disabled={!hasNext}
                      hideLabel
                    />
                  </div>
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
            {Array.from({ length: pseudocode.split('\n').length }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
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
                    blurred && 'text-on-surface/70 group-hover:text-on-surface',
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
    </div>
  );
}
