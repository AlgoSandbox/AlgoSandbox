import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { Badge, Button, MaterialSymbol, Popover } from '@components/ui';
import { isParameterizedAlgorithm } from '@utils';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AlgorithmDetails } from '..';
import { useBoxContext } from '../box-context';
import CatalogSelect from './CatalogSelect';

export default function AlgorithmSelect() {
  const { addTab } = useTabManager();
  const { isAdvancedModeEnabled } = useUserPreferences();
  const { visible: customPanelVisible } = useBoxContext(
    'algorithm.customPanel',
  );
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
      (key) => parameters[key] !== defaultParameters[key],
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
              variant="filled"
              icon={<MaterialSymbol icon="tune" />}
            />
          </Badge>
        </Popover>
      )}
      {isAdvancedModeEnabled && selectedOption && (
        <Button
          label="Edit algorithm in new tab"
          hideLabel
          role="checkbox"
          selected={customPanelVisible}
          onClick={() => {
            addTab({
              type: 'editor',
              label: selectedOption.label,
              object: selectedOption.value,
            });
          }}
          icon={<MaterialSymbol icon="edit" />}
        />
      )}
    </div>
  );
}
