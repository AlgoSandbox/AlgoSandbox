import { ComponentTag } from '@algo-sandbox/core';
import { CatalogGroup, CatalogOption } from '@constants/catalog';

import { DbSandboxObjectSaved, DbSandboxObjectType } from './db';
import hyphenCaseToWords from './hyphenCaseToWords';

type GroupOptionsByTagOptions = {
  omitTags?: Array<ComponentTag>;
};

export default function groupOptionsByTag<T extends DbSandboxObjectType>(
  options: Array<CatalogOption<DbSandboxObjectSaved<T>>>,
  { omitTags = [] }: GroupOptionsByTagOptions = {},
): Array<CatalogGroup<DbSandboxObjectSaved<T>>> {
  const tags = Array.from(
    new Set(options.flatMap((option) => option.value.tags)),
  )
    .filter((tag) => !omitTags.includes(tag))
    .sort();

  const noTagOptions = options.filter(
    (option) => !option.value.tags.some((tag) => tags.includes(tag)),
  );

  return [
    ...tags.map((tag) => {
      return {
        key: tag,
        label: hyphenCaseToWords(tag),
        options: options
          .filter((option) => option.value.tags.includes(tag))
          .map((option) => ({
            ...option,
            key: `${tag}.${option.key}`,
          })),
      };
    }),
    {
      key: '.',
      label: 'Ungrouped',
      options: noTagOptions.map((option) => ({
        ...option,
        key: `.${option.key}`,
      })),
    },
  ];
}
