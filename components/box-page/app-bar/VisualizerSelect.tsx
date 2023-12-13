import { useBoxContext } from '@components/box-page';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Badge, Button, MaterialSymbol, Popover } from '@components/ui';
import { isParameterizedVisualizer } from '@utils';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import VisualizerDetails from '../VisualizerDetails';
import CatalogSelect from './CatalogSelect';

export default function VisualizerSelect() {
  const { isAdvancedModeEnabled } = useUserPreferences();
  const { setVisible: setCustomPanelVisible, visible: customPanelVisible } =
    useBoxContext('visualizer.customPanel');
  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = useBoxContext('visualizer.select');
  const visualizer = useBoxContext('visualizer.value');
  const {
    default: defaultParameters,
    setValue: setParameters,
    value: parameters = {},
  } = useBoxContext('visualizer.parameters');

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
        label="Visualizer"
        options={options}
        value={selectedOption ?? undefined}
        onChange={(value) => {
          setSelectedOption(value as typeof selectedOption);
        }}
      />
      {visualizer !== null && isParameterizedVisualizer(visualizer) && (
        <Popover
          content={
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit((values) => {
                  methods.reset(values);
                  setParameters(values);
                })}
              >
                <VisualizerDetails visualizer={visualizer} />
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
      {isAdvancedModeEnabled && selectedOption !== undefined && (
        <Button
          label="Edit visualizer"
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
