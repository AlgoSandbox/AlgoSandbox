import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { CatalogGroup } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';

import { BoxContextSandboxObject, useBoxContextSandboxObject } from '.';

export type BoxContextVisualizer = BoxContextSandboxObject<'visualizer'>;

export default function useBoxContextVisualizer({
  builtInVisualizerOptions,
  defaultKey,
  onKeyChange,
}: {
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  defaultKey: SandboxKey<'visualizer'> | undefined;
  onKeyChange: (key: SandboxKey<'visualizer'>) => void;
}) {
  return useBoxContextSandboxObject({
    type: 'visualizer',
    builtInOptions: builtInVisualizerOptions,
    addSavedObjectMutation: useAddSavedVisualizerMutation(),
    setSavedObjectMutation: useSetSavedVisualizerMutation(),
    removeSavedObjectMutation: useRemoveSavedVisualizerMutation(),
    savedObjects: useSavedVisualizersQuery().data,
    defaultKey,
    onSelect: ({ key }) => {
      onKeyChange(key);
    },
  }) as BoxContextVisualizer;
}
