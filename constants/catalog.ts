import { SelectGroup, SelectOption } from '../components/ui';

export type CatalogOption<T, K extends string = string> = SelectOption<T, K> & {
  type: 'custom' | 'built-in';
  disabled?: boolean;
  tooltip?: string;
};

export type CatalogGroup<T, K extends string = string> = Omit<
  SelectGroup<T, K>,
  'options'
> & {
  options: Array<CatalogOption<T>>;
};

export type CatalogOptions<T, K extends string = string> = Array<
  CatalogGroup<T, K> | CatalogOption<T, K>
>;
