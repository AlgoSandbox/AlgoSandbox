import { Button, MaterialSymbol } from '@/components';
import clsx from 'clsx';
import AdapterListPopover from '../AdapterListPopover';
import { useBoxContext } from '../BoxContextProvider';

export default function AlgorithmVisualizerAdapterSelect() {
  const { instance: algorithmInstance } = useBoxContext('algorithm');
  const {
    compatible,
    adapters: { options, value, setValue },
  } = useBoxContext('algorithmVisualizer');
  const { instance: visualizerInstance } = useBoxContext('visualizer');

  return (
    <AdapterListPopover
      fromType={algorithmInstance.outputs}
      toType={visualizerInstance.accepts}
      value={value}
      onChange={setValue}
      options={options}
    >
      <Button
        variant="tertiary"
        label="Select adapter"
        hideLabel
        icon={
          <MaterialSymbol
            icon="keyboard_double_arrow_right"
            className={clsx(
              compatible && 'text-neutral-500',
              !compatible && 'text-red-500'
            )}
          />
        }
      />
    </AdapterListPopover>
  );
}
