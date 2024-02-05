import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { CatalogGroup } from '@constants/catalog';
import { DbVisualizerSaved } from '@utils/db';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';
import { useState } from 'react';

import {
  BoxContextSandboxObject,
  defaultBoxContextSandboxObject,
  useBoxContextSandboxObject,
} from '.';

export type BoxContextVisualizers = ReturnType<typeof useBoxContextVisualizers>;

export default function useBoxContextVisualizers() {
  const [aliases, setAliases] = useState<
    Record<string, SandboxKey<'visualizer'>>
  >({});
  const [order, setOrder] = useState<string[]>([]);

  return {
    aliases,
    order,
    setAlias: (alias: string, key: SandboxKey<'visualizer'>) => {
      setAliases((aliases) => ({ ...aliases, [alias]: key }));
    },
    appendAlias: (alias: string, key: SandboxKey<'visualizer'>) => {
      setAliases((aliases) => ({ ...aliases, [alias]: key }));
      setOrder((order) => [...order, alias]);
    },
    removeAlias: (alias: string) => {
      setAliases((aliases) => {
        const { [alias]: _, ...rest } = aliases;
        return rest;
      });
      setOrder((order) => order.filter((o) => o !== alias));
    },
  };
  // return useBoxContextSandboxObject({
  //   type: 'visualizer',
  //   builtInOptions: builtInVisualizerOptions,
  //   addSavedObjectMutation: useAddSavedVisualizerMutation(),
  //   setSavedObjectMutation: useSetSavedVisualizerMutation(),
  //   removeSavedObjectMutation: useRemoveSavedVisualizerMutation(),
  //   savedObjects: useSavedVisualizersQuery().data,
  //   defaultKey,
  //   onSelect: ({ key }) => {
  //     onKeyChange(key);
  //   },
  // }) as BoxContextVisualizer;
}
