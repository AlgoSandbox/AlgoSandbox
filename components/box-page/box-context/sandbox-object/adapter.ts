import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
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
  options,
  key,
  onKeyChange,
  parameters,
  onParametersChange,
}: {
  options: Array<CatalogGroup<DbAdapterSaved>>;
  key: SandboxKey<'adapter'> | null;
  onKeyChange: (key: SandboxKey<'adapter'> | null) => void;
  parameters: Record<string, unknown> | null;
  onParametersChange: (parameters: Record<string, unknown> | null) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'adapter',
    options,
    addSavedObjectMutation: useAddSavedAdapterMutation(),
    setSavedObjectMutation: useSetSavedAdapterMutation(),
    removeSavedObjectMutation: useRemoveSavedAdapterMutation(),
    savedObjects: useSavedAdaptersQuery().data,
    key,
    onKeyChange,
    parameters,
    onParametersChange,
  }) as BoxContextAdapter;
}
