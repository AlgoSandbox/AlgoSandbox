import { Badge, Button, MaterialSymbol, Popover } from '@components/ui';
import { isParameterizedAlgorithm } from '@utils';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AlgorithmDetails } from '..';
import { useBoxContext } from '../box-context';
import CatalogSelect from './CatalogSelect';

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
    value: parameters = {},
  } = useBoxContext('algorithm.parameters');

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
      <CatalogSelect
        label="Algorithm"
        options={options}
        value={selectedOption ?? undefined}
        onChange={setSelectedOption}
      />
      {algorithm !== null && isParameterizedAlgorithm(algorithm) && (
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
