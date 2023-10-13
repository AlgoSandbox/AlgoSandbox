import { Button, MaterialSymbol } from '@/components';
import clsx from 'clsx';
import AdapterListPopover from '../AdapterListPopover';
import { useBoxContext } from '../BoxContextProvider';

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
      fromType={problemInstance.shape}
      toType={algorithmInstance.accepts}
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
