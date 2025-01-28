'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBoxContext } from '@components/box-page';
import ParameterControl from '@components/box-page/ParameterControl';
import { useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

export function BoxPageHeaderParameters() {
  const { default: defaultParameters, value: parameters = {} } =
    useBoxContext('problem.parameters');
  const methods = useForm({
    values: parameters ?? defaultParameters ?? {},
  });
  const problemValue = useBoxContext('problem.value');
  const { value: selectedOption, setValue: setSelectedOption } =
    useBoxContext('problem.select');
  const component = useMemo(
    () => problemValue.mapLeft(() => null).value,
    [problemValue],
  );
  const setParameters = useCallback(
    (newParameters: Record<string, any>) => {
      setSelectedOption(selectedOption, newParameters);
    },
    [selectedOption, setSelectedOption],
  );

  if (component === null || !('parameters' in component)) {
    return null;
  }

  const parameterValues = component.parameters;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((values) => {
          methods.reset(values);
          setParameters(values);
        })}
      >
        <div className="flex flex-row gap-2  items-center">
          {Object.entries(parameterValues).map(([field, parameter]) => (
            <ParameterControl
              key={field}
              fieldName={field}
              parameter={parameter}
              onSave={() => {
                setParameters(methods.getValues());
              }}
            />
          ))}
        </div>
      </form>
    </FormProvider>
  );
}
