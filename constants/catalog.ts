import { SelectGroup, SelectOption } from '../components/ui';

export type CatalogOption<T> = SelectOption<T> & {
  type: 'custom' | 'built-in';
};

export type CatalogGroup<T> = Omit<SelectGroup<T>, 'options'> & {
  options: Array<CatalogOption<T>>;
};

export type CatalogOptions<T> = Array<CatalogGroup<T> | CatalogOption<T>>;
