/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorOr } from '@app/errors/ErrorContext';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import {
  Badge,
  Button,
  Heading,
  HeadingContent,
  MaterialSymbol,
  Popover,
} from '@components/ui';
import { CatalogOption, CatalogOptions } from '@constants/catalog';
import { DbSandboxObjectType } from '@utils/db';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ParameterControls } from '..';
import { DbObjectSaved, Value } from '../box-context/sandbox-object';
import CatalogSelect from './CatalogSelect';

export default function ComponentSelect<T extends DbSandboxObjectType>({
  className,
  label,
  hideLabel,
  hideErrors,
  value: selectedOption,
  onChange: setSelectedOption,
  options,
  evaluatedValue,
  defaultParameters,
  setParameters,
  parameters = {},
}: {
  className?: string;
  label: string;
  hideLabel?: boolean;
  hideErrors?: boolean;
  value: CatalogOption<DbObjectSaved<T>> | null;
  onChange: (value: CatalogOption<DbObjectSaved<T>> | null) => void;
  options: CatalogOptions<DbObjectSaved<T>>;
  evaluatedValue: ErrorOr<Value<T> | null>;
  defaultParameters: Readonly<Record<string, any>> | null;
  setParameters: (value: Record<string, any> | null) => void;
  parameters: Record<string, any> | null;
}) {
  const { addOrFocusTab } = useTabManager();
  const { isAdvancedModeEnabled } = useUserPreferences();

  const methods = useForm({
    values: parameters ?? defaultParameters ?? {},
  });

  const component = useMemo(
    () => evaluatedValue.mapLeft(() => null).value,
    [evaluatedValue],
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

    return evaluatedValue
      .mapRight(() => [])
      .value.map((error) => error.message)
      .join('\n');
  }, [evaluatedValue, hideErrors]);

  useEffect(() => {
    methods.reset(parameters ?? defaultParameters ?? {});
  }, [parameters, methods, defaultParameters]);

  return (
    <div className={clsx('flex items-end gap-2', className)}>
      <CatalogSelect
        label={label}
        hideLabel={hideLabel}
        containerClassName="flex-1"
        options={options}
        value={selectedOption ?? undefined}
        onChange={setSelectedOption}
        errorMessage={errorMessage}
      />
      {component !== null && 'parameters' in component && (
        <Popover
          content={
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((values) => {
                  methods.reset(values);
                  setParameters(values);
                })}
              >
                <div className="p-4 bg-surface">
                  <div className="font-medium flex flex-col gap-2">
                    <Heading variant="h4">Parameters</Heading>
                    <HeadingContent>
                      <ParameterControls parameters={component.parameters} />
                    </HeadingContent>
                  </div>
                </div>
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
          label="Edit in new tab"
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
