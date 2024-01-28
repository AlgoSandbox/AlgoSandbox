import { CatalogGroup } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import {
  useAddSavedAdapterMutation,
  useRemoveSavedAdapterMutation,
  useSavedAdaptersQuery,
  useSetSavedAdapterMutation,
} from '@utils/db/adapters';

import {
  BoxContextSandboxObject,
  defaultBoxContextSandboxObject,
  useBoxContextSandboxObject,
} from '.';

export type BoxContextAdapter = BoxContextSandboxObject<'adapter'>;

export const defaultBoxContextAdapter =
  defaultBoxContextSandboxObject as BoxContextAdapter;

export default function useBoxContextAdapter({
  builtInAdapterOptions,
}: {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
}) {
  return useBoxContextSandboxObject({
    type: 'adapter',
    builtInOptions: builtInAdapterOptions,
    addSavedObjectMutation: useAddSavedAdapterMutation(),
    setSavedObjectMutation: useSetSavedAdapterMutation(),
    removeSavedObjectMutation: useRemoveSavedAdapterMutation(),
    savedObjects: useSavedAdaptersQuery().data,
  }) as BoxContextAdapter;
}
