import { ErrorEntry } from '@app/errors/ErrorContext';
import { MaterialSymbol } from '@components/ui';

export default function ErrorDisplay({
  errors,
}: {
  errors: Array<ErrorEntry>;
}) {
  return (
    <div className="w-full h-full p-4 overflow-y-auto flex flex-col gap-2 items-stretch border-b">
      <div className="flex items-center gap-2 text-danger">
        <MaterialSymbol icon="error" />
        <span className="text-lg">Error in evaluation</span>
      </div>
      <ul className="text-xs">
        {errors.map((errorEntry) => (
          <li
            key={errorEntry.message}
            className="p-4 border rounded bg-surface-high"
          >
            <pre>{errorEntry.message}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
