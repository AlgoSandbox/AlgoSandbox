import { SandboxObjectType } from '@algo-sandbox/components';
import { Instance } from '@components/box-page/box-context/sandbox-object';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { CatalogOption, CatalogOptions } from '@constants/catalog';
import { DbSandboxObjectSaved } from '@utils/db';
import evalSavedObject from '@utils/eval/evalSavedObject';
import filterCatalogOptions from '@utils/filterCatalogOptions';
import { useMemo } from 'react';

export function useFilteredObjectOptions<T extends SandboxObjectType>({
  options,
  selectedOption,
  filter,
}: {
  options: CatalogOptions<DbSandboxObjectSaved<T>>;
  selectedOption: CatalogOption<DbSandboxObjectSaved<T>> | null;
  filter: (instance: Instance<T>, otherInstance: Instance<T>) => boolean;
}) {
  const { flowchartMode } = useUserPreferences();

  const filteredOptions = useMemo(() => {
    if (flowchartMode === 'full' || selectedOption === null) {
      return options;
    }

    const selectedObject = evalSavedObject(selectedOption.value).mapLeft(
      () => null,
    ).value;

    if (selectedObject === null) {
      return options;
    }

    const selectedObjectInstance =
      'parameters' in selectedObject
        ? selectedObject.create()
        : (selectedObject as Instance<T>);

    // else, only return options that are perfectly compatible
    return filterCatalogOptions(options, (option) => {
      const object = evalSavedObject(option).mapLeft(() => null).value;

      if (object === null) {
        return false;
      }
      const objectInstance =
        'parameters' in object ? object.create() : (object as Instance<T>);

      return filter(selectedObjectInstance, objectInstance);
    });
  }, [filter, flowchartMode, options, selectedOption]);

  return filteredOptions;
}
