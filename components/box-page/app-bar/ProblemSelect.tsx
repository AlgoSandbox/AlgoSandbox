import { useBoxContext } from '@components/box-page';

import ComponentSelect from './ComponentSelect';

export default function ProblemSelect({
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

  return (
    <ComponentSelect<'problem'>
      className={className}
      label="Problem"
      hideLabel={hideLabel}
      hideErrors={hideErrors}
      value={selectedOption}
      onChange={setSelectedOption}
      options={options}
      evaluatedValue={problemEvaluation}
      defaultParameters={defaultParameters}
      setParameters={setParameters}
      parameters={parameters}
    />
  );
}
