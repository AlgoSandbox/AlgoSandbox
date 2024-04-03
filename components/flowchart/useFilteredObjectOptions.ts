import { SandboxObjectType } from '@algo-sandbox/components';
import { Instance } from '@components/box-page/box-context/sandbox-object';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { CatalogOptions } from '@constants/catalog';
import { DbSandboxObjectSaved } from '@utils/db';
import evalSavedObject from '@utils/eval/evalSavedObject';
import filterCatalogOptions from '@utils/filterCatalogOptions';
import { useMemo } from 'react';

export function useFilteredObjectOptions<T extends SandboxObjectType>({
  options,
  filter,
}: {
  options: CatalogOptions<DbSandboxObjectSaved<T>>;
  filter: (instance: Instance<T>) => string | true;
}) {
  const { flowchartMode } = useUserPreferences();

  const filteredOptions = useMemo(() => {
    if (flowchartMode === 'full') {
      return options;
    }

    // else, only return options that are perfectly compatible
    return filterCatalogOptions(options, (option) => {
      const object = evalSavedObject(option).mapLeft(() => null).value;

      if (object === null) {
        return 'Error in evaluating object instance';
      }

      const objectInstance =
        'parameters' in object ? object.create() : (object as Instance<T>);

      return filter(objectInstance);
    });
  }, [filter, flowchartMode, options]);

  return filteredOptions;
}
