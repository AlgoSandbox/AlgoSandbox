import { Instance } from '@components/box-page/box-context/sandbox-object';
import { errorFlowchartIncompatibleComponent } from '@constants/flowchart';
import getUsedSlotsForAlias from '@utils/box-config/getUsedSlotsForAlias';
import { useCallback, useMemo } from 'react';

import { useBoxContext } from '../box-page/box-context';
import FlowchartComponentSelect from './FlowchartComponentSelect';
import { useFilteredObjectOptions } from './useFilteredObjectOptions';

export default function FlowchartAlgorithmSelect({
  className,
  hideLabel,
  hideErrors,
}: {
  className?: string;
  hideLabel?: boolean;
  hideErrors?: boolean;
}) {
  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = useBoxContext('algorithm.select');
  const algorithmEvaluation = useBoxContext('algorithm.value');
  const { default: defaultParameters, value: parameters = {} } = useBoxContext(
    'algorithm.parameters',
  );
  const configTree = useBoxContext('config.tree');
  const alias = 'algorithm';

  const { usedInputSlots, usedOutputSlots } = useMemo(() => {
    const usedSlots = getUsedSlotsForAlias(configTree, alias);
    const usedInputSlots = usedSlots
      .filter((slot) => slot.type === 'input')
      .map((slot) => slot.slot);
    const usedOutputSlots = usedSlots
      .filter((slot) => slot.type === 'output')
      .map((slot) => slot.slot);

    return { usedInputSlots, usedOutputSlots };
  }, [configTree, alias]);

  const filter = useCallback(
    (instance: Instance<'algorithm'>) => {
      const inputKeys = Object.keys(instance.accepts.shape.shape);
      const outputKeys = Object.keys(instance.outputs.shape.shape);

      return (
        (usedInputSlots.every((slot) => inputKeys.includes(slot)) &&
          usedOutputSlots.every((slot) => outputKeys.includes(slot))) ||
        errorFlowchartIncompatibleComponent
      );
    },
    [usedInputSlots, usedOutputSlots],
  );

  const filteredOptions = useFilteredObjectOptions({
    options,
    filter,
  });

  return (
    <FlowchartComponentSelect<'algorithm'>
      className={className}
      label="Algorithm"
      hideLabel={hideLabel}
      hideErrors={hideErrors}
      value={selectedOption}
      onChange={setSelectedOption}
      options={filteredOptions}
      evaluatedValue={algorithmEvaluation}
      defaultParameters={defaultParameters}
      parameters={parameters}
    />
  );
}
