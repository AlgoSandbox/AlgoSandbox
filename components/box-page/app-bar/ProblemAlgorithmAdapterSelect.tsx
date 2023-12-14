import { AdapterListPopover, useBoxContext } from '@components/box-page';
import { Button, MaterialSymbol } from '@components/ui';
import clsx from 'clsx';

export default function ProblemAlgorithmAdapterSelect() {
  const { instance: problemInstance } = useBoxContext('problem');
  const { instance: algorithmInstance } = useBoxContext('algorithm');
  const {
    compatible,
    adapters: { options, value, setValue },
  } = useBoxContext('problemAlgorithm');

  return (
    <AdapterListPopover
      fromLabel="Problem"
      toLabel="Algorithm"
      fromType={problemInstance?.type ?? null}
      toType={algorithmInstance?.accepts ?? null}
      value={value}
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
