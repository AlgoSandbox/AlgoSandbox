import { useBoxContext } from '@components/box-page';
import { Badge, Button, MaterialSymbol, Popover, Select } from '@components/ui';
import { isParameteredProblem } from '@utils';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ProblemDetails from '../ProblemDetails';

export default function ProblemSelect() {
  const { setVisible: setCustomPanelVisible, visible: customPanelVisible } =
    useBoxContext('problem.customPanel');
  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = useBoxContext('problem.select');
  const problem = useBoxContext('problem.value');
  const {
    default: defaultParameters,
    setValue: setParameters,
    value: parameters = {},
  } = useBoxContext('problem.parameters');

  const methods = useForm({ defaultValues: defaultParameters ?? {} });

  const changedParameterCount = useMemo(() => {
    if (parameters === null || defaultParameters === null) {
      return 0;
    }

    return Object.keys(parameters ?? {}).filter(
      (key) => parameters[key] !== defaultParameters[key]
    ).length;
  }, [parameters, defaultParameters]);

  useEffect(() => {
    methods.reset(defaultParameters ?? {});
  }, [defaultParameters, methods]);
  return (
    <div className="flex items-end gap-2">
      <Select
        label="Problem"
        options={options}
        value={selectedOption ?? undefined}
        onChange={(value) => {
          setSelectedOption(value as typeof selectedOption);
        }}
      />
      {problem !== null && isParameteredProblem(problem) && (
        <Popover
          content={
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((values) => {
                  methods.reset(values);
                  setParameters(values);
                })}
              >
                <ProblemDetails problem={problem} />
              </form>
            </FormProvider>
          }
        >
          <Badge
            visible={changedParameterCount > 0}
            content={changedParameterCount}
          >
            <Button
              label="Customize"
              hideLabel
              variant="secondary"
              icon={<MaterialSymbol icon="tune" />}
            />
          </Badge>
        </Popover>
      )}
      {selectedOption !== undefined && (
        <Button
          label="Edit problem"
          hideLabel
          role="checkbox"
          selected={customPanelVisible}
          onClick={() => {
            setCustomPanelVisible(!customPanelVisible);
          }}
          icon={<MaterialSymbol icon="edit" />}
        />
      )}
    </div>
  );
}
