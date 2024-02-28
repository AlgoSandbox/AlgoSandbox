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
  key,
  parameters,
  onParametersChange,
  onKeyChange,
}: {
  options: Array<CatalogGroup<DbAlgorithmSaved>>;
  key: SandboxKey<'algorithm'> | null;
  onKeyChange: (key: SandboxKey<'algorithm'> | null) => void;
  parameters: Record<string, unknown> | null;
  onParametersChange: (parameters: Record<string, unknown>) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'algorithm',
    options,
    addSavedObjectMutation: useAddSavedAlgorithmMutation(),
    setSavedObjectMutation: useSetSavedAlgorithmMutation(),
    removeSavedObjectMutation: useRemoveSavedAlgorithmMutation(),
    savedObjects: useSavedAlgorithmsQuery().data,
    key,
    onKeyChange,
    parameters,
    onParametersChange,
  }) as BoxContextAlgorithm;
}
