import { useBoxContext } from '@components/box-page';
import { Instance } from '@components/box-page/box-context/sandbox-object';
import { errorFlowchartIncompatibleComponent } from '@constants/flowchart';
import getUsedSlotsForAlias from '@utils/box-config/getUsedSlotsForAlias';
import { useCallback, useMemo } from 'react';

import FlowchartComponentSelect from './FlowchartComponentSelect';
import { useFilteredObjectOptions } from './useFilteredObjectOptions';

export default function FlowchartProblemSelect({
  hideLabel,
  hideErrors,
  className,
}: {
  hideLabel?: boolean;
  hideErrors?: boolean;
  className?: string;
}) {
  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = useBoxContext('problem.select');
  const problemEvaluation = useBoxContext('problem.value');
  const { default: defaultParameters, value: parameters = {} } =
    useBoxContext('problem.parameters');

  const configTree = useBoxContext('config.tree');
  const alias = 'algorithm';

  const { usedOutputSlots } = useMemo(() => {
    const usedSlots = getUsedSlotsForAlias(configTree, alias);
    const usedOutputSlots = usedSlots
      .filter((slot) => slot.type === 'output')
      .map((slot) => slot.slot);

    return { usedOutputSlots };
  }, [configTree, alias]);

  const filter = useCallback(
    (instance: Instance<'problem'>) => {
      const outputKeys = Object.keys(instance.type.shape.shape);

      return (
        usedOutputSlots.every((slot) => outputKeys.includes(slot)) ||
        errorFlowchartIncompatibleComponent
      );
    },
    [usedOutputSlots],
  );

  const filteredOptions = useFilteredObjectOptions({
    options,
    filter,
  });

  return (
    <FlowchartComponentSelect<'problem'>
      className={className}
      label="Problem"
      hideLabel={hideLabel}
      hideErrors={hideErrors}
      value={selectedOption}
      onChange={setSelectedOption}
      options={filteredOptions}
      evaluatedValue={problemEvaluation}
      defaultParameters={defaultParameters}
      parameters={parameters}
    />
  );
}
