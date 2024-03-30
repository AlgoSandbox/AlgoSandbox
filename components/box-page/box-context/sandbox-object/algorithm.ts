import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { CatalogOption } from '@constants/catalog';
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
  onChange,
}: {
  options: Array<CatalogOption<DbAlgorithmSaved>>;
  key: SandboxKey<'algorithm'> | null;
  parameters: Record<string, unknown> | null;
  onChange: (
    key: SandboxKey<'problem'> | null,
    parameters: Record<string, unknown> | null,
  ) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'algorithm',
    options,
    addSavedObjectMutation: useAddSavedAlgorithmMutation(),
    setSavedObjectMutation: useSetSavedAlgorithmMutation(),
    removeSavedObjectMutation: useRemoveSavedAlgorithmMutation(),
    savedObjects: useSavedAlgorithmsQuery().data,
    key,
    onChange,
    parameters,
  }) as BoxContextAlgorithm;
}
