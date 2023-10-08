import clsx from 'clsx';
import { MaterialSymbol } from '.';

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
  return (
    <div className={clsx(className, 'text-xs overflow-x-hidden')}>
      <div className="flex gap-1">
        <div className="flex flex-col text-neutral-400 items-end">
          {Array.from({ length: pseudocode.split('\n').length }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex flex-col overflow-x-auto">
          {pseudocode.split('\n').map((line, lineIndex) => {
            const lineNumber = lineIndex + 1;
            return (
              <code
                className={clsx(
                  startLine !== undefined &&
                    endLine !== undefined &&
                    startLine <= lineNumber &&
                    lineNumber <= endLine &&
                    'bg-purple-200 w-fit'
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
