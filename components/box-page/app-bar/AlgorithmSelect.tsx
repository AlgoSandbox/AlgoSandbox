import { Badge, Button, MaterialSymbol, Popover, Select } from '@components/ui';
import { isParameteredAlgorithm } from '@utils';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AlgorithmDetails } from '..';
import { useBoxContext } from '../box-context';

export default function AlgorithmSelect() {
  const { setVisible: setCustomPanelVisible, visible: customPanelVisible } =
    useBoxContext('algorithm.customPanel');
  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = useBoxContext('algorithm.select');
  const algorithm = useBoxContext('algorithm.value');
  const {
    default: defaultParameters,
    setValue: setParameters,
    value: algorithmParameters = {},
  } = useBoxContext('algorithm.parameters');

  const methods = useForm({ defaultValues: defaultParameters ?? {} });

  const changedParameterCount = useMemo(() => {
    if (algorithmParameters === null || defaultParameters === null) {
      return 0;
    }

    return Object.keys(algorithmParameters ?? {}).filter(
      (key) => algorithmParameters[key] !== defaultParameters[key]
    ).length;
  }, [algorithmParameters, defaultParameters]);

  useEffect(() => {
    methods.reset(defaultParameters ?? {});
  }, [defaultParameters, methods]);

  return (
    <div className="flex items-end gap-2">
      <Select
        label="Algorithm"
        options={options}
        value={selectedOption}
        onChange={(value) => {
          setSelectedOption(value as typeof selectedOption);
        }}
      />
      {algorithm !== null && isParameteredAlgorithm(algorithm) && (
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
      {selectedOption !== undefined && (
        <Button
          label="Edit algorithm"
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