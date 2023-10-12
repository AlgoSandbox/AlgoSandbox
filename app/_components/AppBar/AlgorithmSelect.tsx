import { Badge, Button, MaterialSymbol, Popover, Select } from '@/components';
import { isParameteredAlgorithm } from '@/utils/isParametered';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { AlgorithmDetails } from '..';
import { useBoxContext } from '../BoxContextProvider';

export default function AlgorithmSelect() {
  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = useBoxContext('algorithm.select');
  const { default: defaultParameters, setValue: setParameters } = useBoxContext(
    'algorithm.parameters'
  );
  const algorithm = selectedOption.value;
  const isAlgorithmCustomizable = isParameteredAlgorithm(algorithm);

  const methods = useForm({ defaultValues: defaultParameters });

  const changedParameterCount = useMemo(() => {
    const algorithmParameters = methods.watch();
    return Object.keys(algorithmParameters).filter(
      (key) => algorithmParameters[key] !== defaultParameters[key]
    ).length;
  }, [defaultParameters, methods]);

  useEffect(() => {
    methods.reset(defaultParameters);
  }, [defaultParameters, methods]);

  return (
    <div className="flex items-end gap-2">
      <Select
        label="Algorithm"
        options={options}
        value={selectedOption}
        onChange={setSelectedOption}
      />
      {isAlgorithmCustomizable && (
        <Popover
          content={
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((values) => {
                  methods.reset(values);
                  setParameters(values);
                })}
              >
                <AlgorithmDetails algorithm={algorithm} />
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
    </div>
  );
}
