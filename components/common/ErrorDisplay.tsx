// import { ErrorEntry } from '@app/errors';
import { MaterialSymbol } from '@components/ui';

// TODO: fix the type of errors; currently, errors is actually a string and not Array<ErrorEntry>
// export default function ErrorDisplay({
//   errors,
// }: {
//   errors: Array<ErrorEntry>;
// }) {
export default function ErrorDisplay({ errors }: { errors: any }) {
  const errorStr = errors as string;
  const errorArr = JSON.stringify(
    errorStr.slice(errorStr.indexOf('[')),
    null,
    2,
  ).replace(/\\n/g, '\n');
  return (
    <div className="w-full h-full p-4 overflow-y-auto flex flex-col gap-2 items-stretch border-b">
      <div className="flex items-center gap-2 text-danger">
        <MaterialSymbol icon="error" />
        <span className="text-lg">Error in evaluation</span>
      </div>
      <p className="whitespace-pre">{errorArr}</p>
      {/* <ul className="text-xs">
        {errorArr.map((error, i) => (
          <li key={i} className="p-4 border rounded bg-surface-high">
            <pre>{error.toString()}</pre>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
