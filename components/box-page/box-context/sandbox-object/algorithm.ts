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

export function useBoxContextAlgorithm({
  customPanelVisible,
  setCustomPanelVisible,
  builtInAlgorithmOptions,
}: {
  customPanelVisible: boolean;
  setCustomPanelVisible: (visible: boolean) => void;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
}) {
  return useBoxContextSandboxObject({
    type: 'algorithm',
    customPanelVisible,
    setCustomPanelVisible,
    builtInOptions: builtInAlgorithmOptions,
    addSavedObjectMutation: useAddSavedAlgorithmMutation(),
    setSavedObjectMutation: useSetSavedAlgorithmMutation(),
    removeSavedObjectMutation: useRemoveSavedAlgorithmMutation(),
    savedObjects: useSavedAlgorithmsQuery().data,
  }) as BoxContextAlgorithm;
}
