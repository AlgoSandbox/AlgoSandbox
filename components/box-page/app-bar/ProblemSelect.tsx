import { useBoxContext } from '@components/box-page';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { Badge, Button, MaterialSymbol, Popover } from '@components/ui';
import { isParameterizedProblem } from '@utils';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ProblemDetails from '../ProblemDetails';
import CatalogSelect from './CatalogSelect';

export default function ProblemSelect() {
  const { addTab } = useTabManager();
  const { isAdvancedModeEnabled } = useUserPreferences();
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
  const errorMessage = useBoxContext('problem.errorMessage');

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
        label="Problem"
        options={options}
        errorMessage={errorMessage}
        value={selectedOption ?? undefined}
        onChange={(value) => {
          setSelectedOption(value as typeof selectedOption);
        }}
      />
      {problem !== null && isParameterizedProblem(problem) && (
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
              variant="filled"
              icon={<MaterialSymbol icon="tune" />}
            />
          </Badge>
        </Popover>
      )}
      {isAdvancedModeEnabled && selectedOption && (
        <Button
          label="Edit problem in new tab"
          hideLabel
          role="checkbox"
          onClick={() => {
            addTab({
              type: 'editor',
              icon: 'extension',
              subIcon: 'edit',
              label: selectedOption.label,
              object: selectedOption.value,
            });
          }}
          icon={<MaterialSymbol icon="open_in_new" />}
        />
      )}
    </div>
  );
}
