import { Select } from '@components';
import { useBoxContext } from '../box-context';

export default function ProblemSelect() {
  const {
    value: selectedOptions,
    setValue: setSelectedOptions,
    options,
  } = useBoxContext('problem.select');

  return (
    <div className="flex items-end gap-2">
      <Select
        label="Problem"
        options={options}
        value={selectedOptions}
        onChange={setSelectedOptions}
      />
    </div>
  );
}
