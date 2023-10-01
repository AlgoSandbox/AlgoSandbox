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
    <div className={clsx(className, 'border rounded px-4 py-2 text-xs')}>
      <div className="flex gap-2 justify-between pb-2 border-b mb-2">
        <span className="font-medium">Pseudocode</span>
        <MaterialSymbol icon="code" />
      </div>
      <div className="flex gap-1">
        <div className="flex flex-col text-neutral-400 items-end">
          {Array.from({ length: pseudocode.split('\n').length }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex flex-col">
          {pseudocode.split('\n').map((line, lineIndex) => {
            const lineNumber = lineIndex + 1;
            return (
              <code
                className={clsx(
                  startLine !== undefined &&
                    endLine !== undefined &&
                    startLine <= lineNumber &&
                    lineNumber <= endLine &&
                    'bg-purple-200 whitespace-pre'
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
