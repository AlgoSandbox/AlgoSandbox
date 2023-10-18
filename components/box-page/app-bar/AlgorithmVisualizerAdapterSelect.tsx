import { AdapterListPopover, useBoxContext } from '@components/box-page';
import { Button, MaterialSymbol } from '@components/ui';
import clsx from 'clsx';

export default function AlgorithmVisualizerAdapterSelect() {
  const { instance: algorithmInstance } = useBoxContext('algorithm');
  const {
    compatible,
    adapters: { options, value, setValue },
  } = useBoxContext('algorithmVisualizer');
  const { instance: visualizerInstance } = useBoxContext('visualizer');

  return (
    <AdapterListPopover
      fromLabel="Algorithm"
      toLabel="Visualizer"
      fromType={algorithmInstance?.outputs ?? null}
      toType={visualizerInstance.accepts}
      value={value}
      onChange={setValue}
      options={options}
    >
      <Button
        variant="tertiary"
        label="Select adapter"
        hideLabel
        className="group"
        icon={
          <MaterialSymbol
            icon="keyboard_double_arrow_right"
            className={clsx(
              'group-aria-expanded:rotate-90 transition',
              compatible && 'text-primary-700',
              !compatible && 'text-red-500'
            )}
          />
        }
      />
    </AdapterListPopover>
  );
}