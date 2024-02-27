import { useBoxContext } from '../box-context';
import ComponentSelect from './ComponentSelect';

export default function AlgorithmSelect({
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

  return (
    <ComponentSelect<'algorithm'>
      className={className}
      label="Algorithm"
      hideLabel={hideLabel}
      hideErrors={hideErrors}
      value={selectedOption}
      onChange={setSelectedOption}
      options={options}
      evaluatedValue={algorithmEvaluation}
      defaultParameters={defaultParameters}
      setParameters={setParameters}
      parameters={parameters}
    />
  );
}
