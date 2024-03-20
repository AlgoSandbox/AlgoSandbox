import { useBoxContext } from '@components/box-page';
import { Instance } from '@components/box-page/box-context/sandbox-object';
import { isEqual } from 'lodash';
import { useCallback } from 'react';

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
  const {
    default: defaultParameters,
    setValue: setParameters,
    value: parameters = {},
  } = useBoxContext('problem.parameters');

  const filter = useCallback(
    (instance: Instance<'problem'>, otherInstance: Instance<'problem'>) => {
      return isEqual(
        Object.keys(instance.type.shape.shape),
        Object.keys(otherInstance.type.shape.shape),
      );
    },
    [],
  );

  const filteredOptions = useFilteredObjectOptions({
    options,
    selectedOption,
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
      setParameters={setParameters}
      parameters={parameters}
    />
  );
}
