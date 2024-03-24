import { ComponentTag } from '@algo-sandbox/core';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { sortBy } from 'lodash';

import { DbSandboxObjectSaved, DbSandboxObjectType } from './db';
import getSandboxObjectConfig from './getSandboxObjectConfig';
import hyphenCaseToWords from './hyphenCaseToWords';

type GroupOptionsByTagOptions = {
  omitTags?: Array<ComponentTag>;
};

export default function groupOptionsByTag<T extends DbSandboxObjectType>(
  options: Array<CatalogOption<DbSandboxObjectSaved<T>>>,
  { omitTags = [] }: GroupOptionsByTagOptions = {},
): Array<CatalogGroup<DbSandboxObjectSaved<T>>> {
  const optionsWithTags = options.map((option) => ({
    ...option,
    value: {
      ...option.value,
      tags: getSandboxObjectConfig(option.value).tags,
    },
  }));

  const tags = Array.from(
    new Set(optionsWithTags.flatMap((option) => option.value.tags)),
  )
    .filter((tag) => !omitTags.includes(tag))
    .sort();

  const noTagOptions = optionsWithTags.filter(
    (option) => !option.value.tags.some((tag) => tags.includes(tag)),
  );

  return sortBy(
    [
      ...tags.map((tag) => {
        return {
          key: tag,
          label: hyphenCaseToWords(tag),
          options: optionsWithTags
            .filter((option) => option.value.tags.includes(tag))
            .map((option) => ({
              ...option,
              key: `${tag}.${option.key}`,
            })),
        };
      }),
      ...(noTagOptions.length > 0
        ? [
            {
              key: '.',
              label: 'Ungrouped',
              options: noTagOptions.map((option) => ({
                ...option,
                key: `.${option.key}`,
              })),
            },
          ]
        : []),
    ],
    (group) => {
      return !group.options.every((option) => option.disabled);
    },
  );
}
