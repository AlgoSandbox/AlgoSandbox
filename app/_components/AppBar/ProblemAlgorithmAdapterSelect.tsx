import { MaterialSymbol, Tooltip } from '@/components';
import clsx from 'clsx';
import { useBoxContext } from '../BoxContextProvider';

export default function ProblemAlgorithmAdapterSelect() {
  const { compatible } = useBoxContext('problemAlgorithm');

  return (
    <Tooltip
      disabled={compatible}
      content="Problem incompatible with algorithm"
    >
      <MaterialSymbol
        icon="keyboard_double_arrow_right"
        className={clsx(
          'pb-2',
          compatible && 'text-neutral-500',
          !compatible && 'text-red-500'
        )}
      />
    </Tooltip>
  );
}
