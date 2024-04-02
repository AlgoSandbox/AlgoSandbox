import { CatalogOptions } from '@constants/catalog';
import { sortBy } from 'lodash';

export default function filterCatalogOptions<T>(
  options: CatalogOptions<T>,
  predicate: (option: T) => string | true,
) {
  return sortBy(
    options.map((item) => {
      if ('options' in item) {
        return {
          ...item,
          options: sortBy(
            item.options.map((option) => {
              const disabledReason = predicate(option.value);
              const disabled = disabledReason !== true;
              const tooltip =
                typeof disabledReason === 'string' ? disabledReason : undefined;
              return {
                ...option,
                disabled,
                tooltip,
              };
            }),
            (option) => {
              return option.disabled;
            },
            'label',
          ),
        };
      }

      return { ...item, disabled: !predicate(item.value) };
    }),
    (option) => {
      if ('options' in option) {
        return option.options.every((option) => option.disabled);
      }

      return option.disabled;
    },
    'label',
  );
}
