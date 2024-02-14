import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import { Button, MaterialSymbol } from '@components/ui';
import { CatalogOption } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import clsx from 'clsx';

// TODO: Take all state ouf of this component
export default function AdapterSelect({
  value,
  onChange,
  className,
  label,
}: {
  value?: CatalogOption<DbAdapterSaved>;
  label: string;
  onChange?: (value: CatalogOption<DbAdapterSaved>) => void;
  className?: string;
}) {
  const { builtInAdapterOptions: options } = useBuiltInComponents();
  const { isAdvancedModeEnabled } = useUserPreferences();
  const { addOrFocusTab } = useTabManager();

  return (
    <div className={clsx('flex items-end gap-2', className)}>
      <CatalogSelect
        containerClassName="flex-1"
        label={label}
        options={options}
        value={value}
        onChange={onChange}
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
