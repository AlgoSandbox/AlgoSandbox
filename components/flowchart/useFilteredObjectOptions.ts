import { SandboxObjectType } from '@algo-sandbox/components';
import { Instance } from '@components/box-page/box-context/sandbox-object';
import { CatalogOptions } from '@constants/catalog';
import { DbSandboxObjectSaved } from '@utils/db';
import evalSavedObject from '@utils/eval/evalSavedObject';
import filterCatalogOptions from '@utils/filterCatalogOptions';
import { useMemo } from 'react';

import { useFlowchartMode } from './FlowchartModeProvider';

export function useFilteredObjectOptions<T extends SandboxObjectType>({
  options,
  filter,
}: {
  options: CatalogOptions<DbSandboxObjectSaved<T>>;
  filter: (instance: Instance<T>) => string | true;
}) {
  const { flowchartMode } = useFlowchartMode();

  const optionsWithEvaluations = useMemo(() => {
    return options.map((option) => {
      if ('options' in option) {
        return {
          ...option,
          options: option.options.map((subOption) => {
            return {
              ...subOption,
              value: {
                option: subOption.value,
                evaluation: evalSavedObject(subOption.value).mapLeft(() => null)
                  .value,
              },
            };
          }),
        };
      }

      return {
        ...option,
        value: {
          option: option.value,
          evaluation: evalSavedObject(option.value).mapLeft(() => null).value,
        },
      };
    });
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (flowchartMode === 'full') {
      return options;
    }

    // else, only return options that are perfectly compatible
    return filterCatalogOptions(optionsWithEvaluations, (option) => {
      const object = option.evaluation;

      if (object === null) {
        return 'Error in evaluating object instance';
      }

      const objectInstance =
        'parameters' in object ? object.create() : (object as Instance<T>);

      return filter(objectInstance);
    }).map((option) => {
      if ('options' in option) {
        return {
          ...option,
          options: option.options.map((subOption) => {
            return {
              ...subOption,
              value: subOption.value.option,
            };
          }),
        };
      }

      return {
        ...option,
        value: option.value.option,
      };
    });
  }, [filter, flowchartMode, options, optionsWithEvaluations]);

  return filteredOptions;
}
