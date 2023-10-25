import { CatalogGroup } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';

import {
  BoxContextSandboxObject,
  defaultBoxContextSandboxObject,
  useBoxContextSandboxObject,
} from '.';

export type BoxContextVisualizer = BoxContextSandboxObject<'visualizer'>;

export const defaultBoxContextVisualizer =
  defaultBoxContextSandboxObject as BoxContextVisualizer;

export default function useBoxContextVisualizer({
  builtInVisualizerOptions,
  customPanelVisible,
  setCustomPanelVisible,
}: {
  customPanelVisible: boolean;
  setCustomPanelVisible: (visible: boolean) => void;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
}) {
  return useBoxContextSandboxObject({
    type: 'visualizer',
    builtInOptions: builtInVisualizerOptions,
    customPanelVisible,
    setCustomPanelVisible,
    addSavedObjectMutation: useAddSavedVisualizerMutation(),
    setSavedObjectMutation: useSetSavedVisualizerMutation(),
    removeSavedObjectMutation: useRemoveSavedVisualizerMutation(),
    savedObjects: useSavedVisualizersQuery().data,
  }) as BoxContextVisualizer;
}
