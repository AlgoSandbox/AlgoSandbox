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
  options,
  defaultKey,
  onKeyChange,
}: {
  options: Array<CatalogGroup<DbAlgorithmSaved>>;
  defaultKey: SandboxKey<'algorithm'> | undefined;
  onKeyChange: (key: SandboxKey<'algorithm'>) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'algorithm',
    options,
    addSavedObjectMutation: useAddSavedAlgorithmMutation(),
    setSavedObjectMutation: useSetSavedAlgorithmMutation(),
    removeSavedObjectMutation: useRemoveSavedAlgorithmMutation(),
    savedObjects: useSavedAlgorithmsQuery().data,
    defaultKey,
    onSelect: ({ key }) => {
      onKeyChange(key);
    },
  }) as BoxContextAlgorithm;
}
