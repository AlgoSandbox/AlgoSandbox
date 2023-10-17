import { Select } from '@components';
import { useBoxContext } from '../box-context';

export default function VisualizerSelect() {
  const { options, setValue, value } = useBoxContext('visualizer.select');

  return (
    <Select
      label="Visualizer"
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}
