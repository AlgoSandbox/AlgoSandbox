import { useBoxContext } from '../box-page/box-context';
import FlowchartComponentSelect from './FlowchartComponentSelect';

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

  return (
    <FlowchartComponentSelect<'algorithm'>
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
