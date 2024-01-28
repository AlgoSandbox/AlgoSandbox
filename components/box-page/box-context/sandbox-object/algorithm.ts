import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { CatalogGroup } from '@constants/catalog';
import {
  DbAlgorithmSaved,
  useAddSavedAlgorithmMutation,
  useRemoveSavedAlgorithmMutation,
  useSavedAlgorithmsQuery,
  useSetSavedAlgorithmMutation,
} from '@utils/db';

import {
  BoxContextSandboxObject,
  defaultBoxContextSandboxObject,
  useBoxContextSandboxObject,
} from '.';

export type BoxContextAlgorithm = BoxContextSandboxObject<'algorithm'>;

export const defaultBoxContextAlgorithm =
  defaultBoxContextSandboxObject as BoxContextAlgorithm;

export default function useBoxContextAlgorithm({
  builtInAlgorithmOptions,
  defaultKey,
}: {
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  defaultKey: SandboxKey<'algorithm'> | undefined;
}) {
  return useBoxContextSandboxObject({
    type: 'algorithm',
    builtInOptions: builtInAlgorithmOptions,
    addSavedObjectMutation: useAddSavedAlgorithmMutation(),
    setSavedObjectMutation: useSetSavedAlgorithmMutation(),
    removeSavedObjectMutation: useRemoveSavedAlgorithmMutation(),
    savedObjects: useSavedAlgorithmsQuery().data,
    defaultKey,
  }) as BoxContextAlgorithm;
}
