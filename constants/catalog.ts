import {
  counterToSearchGraphStateAdapter,
  searchGraphStateToCounterAdapter,
} from '@algo-sandbox/adapters';
import { SandboxAdapter } from '@algo-sandbox/core';

import { SelectGroup, SelectOption, SelectOptions } from '../components/ui';

export type CatalogOption<T> = SelectOption<T> & {
  type: 'custom' | 'built-in';
};

export type CatalogGroup<T> = Omit<SelectGroup<T>, 'options'> & {
  options: Array<CatalogOption<T>>;
};

export type CatalogOptions<T> = Array<CatalogGroup<T> | CatalogOption<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adapterOptions: SelectOptions<SandboxAdapter<any, any>> = [
  {
    key: 'counterToSearch',
    label: 'Counter to search graph',
    value: counterToSearchGraphStateAdapter,
  },
  {
    key: 'searchToCounter',
    label: 'Search graph to counter',
    value: searchGraphStateToCounterAdapter,
  },
];
