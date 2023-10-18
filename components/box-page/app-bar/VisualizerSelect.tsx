import { useBoxContext } from '@components/box-page';
import { Select } from '@components/ui';

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
