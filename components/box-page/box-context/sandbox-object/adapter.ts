import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { CatalogOption } from '@constants/catalog';
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
  options,
  key,
  onChange,
  parameters,
}: {
  options: Array<CatalogOption<DbAdapterSaved>>;
  key: SandboxKey<'adapter'> | null;
  parameters: Record<string, unknown> | null;
  onChange: (
    key: SandboxKey<'problem'> | null,
    parameters: Record<string, unknown> | null,
  ) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'adapter',
    options,
    addSavedObjectMutation: useAddSavedAdapterMutation(),
    setSavedObjectMutation: useSetSavedAdapterMutation(),
    removeSavedObjectMutation: useRemoveSavedAdapterMutation(),
    savedObjects: useSavedAdaptersQuery().data,
    key,
    onChange,
    parameters,
  }) as BoxContextAdapter;
}
