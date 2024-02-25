import { useBoxContext } from '@components/box-page';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { Button, MaterialSymbol } from '@components/ui';
import clsx from 'clsx';
import { useMemo } from 'react';

export default function FlowchartAdapterSelect({
  className,
  label,
  alias,
}: {
  label: string;
  alias: string;
  className?: string;
}) {
  const { builtInAdapterOptions: options } = useBuiltInComponents();
  const { isAdvancedModeEnabled } = useUserPreferences();
  const { addOrFocusTab } = useTabManager();
  const setAlgorithmVisualizers = useBoxContext('algorithmVisualizers.set');
  const algorithmVisualizersTree = useBoxContext('algorithmVisualizers.tree');

  const adapterKey = useMemo(
    () => (algorithmVisualizersTree.adapters ?? {})[alias],
    [algorithmVisualizersTree.adapters, alias],
  );

  const value = useMemo(() => {
    const flattenedOptions = options.flatMap((item) =>
      'options' in item ? item.options : item,
    );
    return flattenedOptions.find((option) => option.key === adapterKey)!;
  }, [options, adapterKey]);

  return (
    <div className={clsx('flex items-end gap-2', className)}>
      <CatalogSelect
        containerClassName="flex-1"
        hideLabel
        label={label}
        options={options}
        value={value}
        onChange={(value) => {
          setAlgorithmVisualizers({
            adapters: {
              ...algorithmVisualizersTree.adapters,
              [alias]: value.key,
            },
            composition: {
              ...algorithmVisualizersTree.composition,
              connections:
                algorithmVisualizersTree.composition.connections.filter(
                  ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
                ),
            },
          });
        }}
      />
      {isAdvancedModeEnabled && value && (
        <Button
          label="Edit adapter in new tab"
          hideLabel
          role="checkbox"
          onClick={() => {
            addOrFocusTab({
              type: 'editor',
              label: value.label,
              data: { object: value.value },
            });
          }}
          icon={<MaterialSymbol icon="edit" />}
        />
      )}
    </div>
  );
}
