import clsx from 'clsx';

export type PseudocodeProps = {
  pseudocode: string;
  startLine?: number;
  endLine?: number;
  className?: string;
};

export default function Pseudocode({
  pseudocode,
  startLine,
  endLine,
  className,
}: PseudocodeProps) {
  const hasHighlight = startLine !== undefined && endLine !== undefined;

  return (
    <div
      className={clsx(className, 'group relative text-xs overflow-x-hidden')}
    >
      <div className="flex gap-1">
        {hasHighlight && (
          <span
            className="w-full bg-primary/30 absolute top-0 -z-10 transition-all rounded"
            style={{
              transform: `translateY(${startLine - 1}rem)`,
              height: `${endLine - startLine + 1}rem`,
            }}
          />
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
              startLine !== undefined && endLine !== undefined && !highlighted;
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
  );
}
