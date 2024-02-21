import { AdapterListPopover, useBoxContext } from '@components/box-page';
import { Button, MaterialSymbol } from '@components/ui';
import clsx from 'clsx';
import { useMemo } from 'react';

export default function ProblemAlgorithmAdapterSelect() {
  const { instance: problemInstance } = useBoxContext('problem');
  const { instance: algorithmInstance } = useBoxContext('algorithm');
  const {
    compatible,
    adapters: { options, value, setValue, evaluated },
  } = useBoxContext('problemAlgorithm');

  const valueEvaluated = useMemo(() => {
    return Object.fromEntries(
      evaluated.map((evaluation) => [evaluation.key, evaluation]),
    );
  }, [evaluated]);

  return (
    <AdapterListPopover
      fromLabel="Problem"
      toLabel="Algorithm"
      fromType={problemInstance?.type ?? null}
      toType={algorithmInstance?.accepts ?? null}
      value={value}
      evaluated={valueEvaluated}
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
