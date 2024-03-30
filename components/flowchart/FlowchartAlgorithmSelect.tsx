import { Instance } from '@components/box-page/box-context/sandbox-object';
import { errorFlowchartIncompatibleComponent } from '@constants/flowchart';
import { isEqual } from 'lodash';
import { useCallback } from 'react';

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
  const {
    default: defaultParameters,
    setValue: setParameters,
    value: parameters = {},
  } = useBoxContext('algorithm.parameters');

  const filter = useCallback(
    (instance: Instance<'algorithm'>, otherInstance: Instance<'algorithm'>) => {
      return (
        (isEqual(
          Object.keys(instance.accepts.shape.shape),
          Object.keys(otherInstance.accepts.shape.shape),
        ) &&
          isEqual(
            Object.keys(instance.outputs.shape.shape),
            Object.keys(otherInstance.outputs.shape.shape),
          )) ||
        errorFlowchartIncompatibleComponent
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
      setParameters={setParameters}
      parameters={parameters}
    />
  );
}
