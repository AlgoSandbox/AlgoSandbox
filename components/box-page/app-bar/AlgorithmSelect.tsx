import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { Badge, Button, MaterialSymbol, Popover } from '@components/ui';
import { isParameterizedAlgorithm } from '@utils';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { AlgorithmDetails } from '..';
import { useBoxContext } from '../box-context';
import CatalogSelect from './CatalogSelect';

export default function AlgorithmSelect({
  className,
  hideLabel,
  hideErrors,
}: {
  className?: string;
  hideLabel?: boolean;
  hideErrors?: boolean;
}) {
  const { addOrFocusTab } = useTabManager();
  const { isAdvancedModeEnabled } = useUserPreferences();
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

  const methods = useForm({ defaultValues: defaultParameters ?? {} });

  const algorithm = useMemo(
    () => algorithmEvaluation.mapLeft(() => null).value,
    [algorithmEvaluation],
  );

  const changedParameterCount = useMemo(() => {
    if (parameters === null || defaultParameters === null) {
      return 0;
    }

    return Object.keys(parameters ?? {}).filter(
      (key) => parameters[key] !== defaultParameters[key],
    ).length;
  }, [parameters, defaultParameters]);

  const errorMessage = useMemo(() => {
    if (hideErrors) {
      return null;
    }

    return algorithmEvaluation
      .mapRight(() => [])
      .value.map((error) => error.message)
      .join('\n');
  }, [algorithmEvaluation, hideErrors]);

  useEffect(() => {
    methods.reset(defaultParameters ?? {});
  }, [defaultParameters, methods]);

  return (
    <div className={clsx('flex items-end gap-2', className)}>
      <CatalogSelect
        label="Algorithm"
        hideLabel={hideLabel}
        containerClassName="flex-1"
        options={options}
        value={selectedOption ?? undefined}
        onChange={setSelectedOption}
        errorMessage={errorMessage}
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
          onClick={() => {
            addOrFocusTab({
              type: 'editor',
              label: selectedOption.label,
              data: { object: selectedOption.value },
            });
          }}
          icon={<MaterialSymbol icon="edit" />}
        />
      )}
    </div>
  );
}
