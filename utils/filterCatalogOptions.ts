import { CatalogOptions } from '@constants/catalog';
import { sortBy } from 'lodash';

export default function filterCatalogOptions<T>(
  options: CatalogOptions<T>,
  predicate: (option: T) => boolean,
) {
  return sortBy(
    options.map((item) => {
      if ('options' in item) {
        return {
          ...item,
          options: sortBy(
            item.options.map((option) => ({
              ...option,
              disabled: !predicate(option.value),
            })),
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
