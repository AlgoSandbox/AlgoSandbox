import { useBoxContext } from '@components/box-page';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useBoxContextSandboxObject } from '@components/box-page/box-context/sandbox-object';
import VisualizerDetails from '@components/box-page/VisualizerDetails';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { Badge, Button, MaterialSymbol, Popover } from '@components/ui';
import { isParameterizedVisualizer } from '@utils';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

// TODO: Take all state ouf of this component
export default function VisualizerSelect({
  alias,
  onChange,
  className,
}: {
  alias: string;
  onChange: () => void;
  className?: string;
}) {
  const { addOrFocusTab } = useTabManager();
  const { isAdvancedModeEnabled } = useUserPreferences();
  const { builtInVisualizerOptions } = useBuiltInComponents();
  const aliases = useBoxContext('visualizers.aliases');
  const setAlias = useBoxContext('visualizers.setAlias');

  const visualizerKey = aliases[alias];

  const visualizerObject = useBoxContextSandboxObject({
    type: 'visualizer',
    builtInOptions: builtInVisualizerOptions,
    addSavedObjectMutation: useAddSavedVisualizerMutation(),
    setSavedObjectMutation: useSetSavedVisualizerMutation(),
    removeSavedObjectMutation: useRemoveSavedVisualizerMutation(),
    savedObjects: useSavedVisualizersQuery().data,
    defaultKey: visualizerKey,
    onSelect: ({ key }) => {
      setAlias(alias, key);
      onChange();
    },
  });

  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = visualizerObject.select;

  const visualizer = visualizerObject.value;

  const {
    default: defaultAll,
    setValue: setParameters,
    value: parameters,
  } = useBoxContext('visualizers.parameters');

  const defaultParameters = useMemo(
    () => defaultAll[alias] ?? {},
    [alias, defaultAll],
  );

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
    <div className={clsx('flex items-end gap-2', className)}>
      <CatalogSelect
        containerClassName="flex-1"
        label={alias}
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
                  setParameters(alias, values);
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
              variant="filled"
              icon={<MaterialSymbol icon="tune" />}
            />
          </Badge>
        </Popover>
      )}
      {isAdvancedModeEnabled && selectedOption && (
        <Button
          label="Edit visualizer in new tab"
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
