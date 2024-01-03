import { AdapterListPopover, useBoxContext } from '@components/box-page';
import { Button, MaterialSymbol } from '@components/ui';
import clsx from 'clsx';
import { useMemo } from 'react';

export default function AlgorithmVisualizerAdapterSelect() {
  const { instance: algorithmInstance } = useBoxContext('algorithm');
  const {
    compatible,
    adapters: { options, value, setValue, evaluated },
  } = useBoxContext('algorithmVisualizer');
  const { instance: visualizerInstance } = useBoxContext('visualizer');

  const valueEvaluated = useMemo(() => {
    return evaluated.map(({ evaluation }) => evaluation);
  }, [evaluated]);

  return (
    <AdapterListPopover
      fromLabel="Algorithm"
      toLabel="Visualizer"
      fromType={algorithmInstance?.outputs ?? null}
      toType={visualizerInstance?.accepts ?? null}
      value={value}
      valueEvaluated={valueEvaluated}
      onChange={setValue}
      options={options}
    >
      <Button
        variant="flat"
        label="Select adapter"
        hideLabel
        className="group"
        icon={
          <MaterialSymbol
            icon="keyboard_double_arrow_right"
            className={clsx(
              'group-aria-expanded:rotate-90 transition',
              compatible && 'text-primary',
              !compatible && 'text-danger',
            )}
          />
        }
      />
    </AdapterListPopover>
  );
}
