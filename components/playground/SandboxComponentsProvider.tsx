import { CatalogGroup } from '@constants/catalog';
import {
  DbAdapterSaved,
  DbAlgorithmSaved,
  DbBoxSaved,
  DbProblemSaved,
  DbVisualizerSaved,
  useSavedAlgorithmsQuery,
} from '@utils/db';
import { useSavedAdaptersQuery } from '@utils/db/adapters';
import { useSavedBoxesQuery } from '@utils/db/boxes';
import { useSavedProblemsQuery } from '@utils/db/problems';
import { useSavedVisualizersQuery } from '@utils/db/visualizers';
import { createContext, useContext, useMemo } from 'react';

export type SandboxComponents = {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogGroup<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  adapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  algorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  boxOptions: Array<CatalogGroup<DbBoxSaved>>;
  problemOptions: Array<CatalogGroup<DbProblemSaved>>;
  visualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

const BuiltInComponentsContext = createContext<SandboxComponents>({
  builtInAdapterOptions: [],
  builtInAlgorithmOptions: [],
  builtInBoxOptions: [],
  builtInProblemOptions: [],
  builtInVisualizerOptions: [],
  adapterOptions: [],
  algorithmOptions: [],
  boxOptions: [],
  problemOptions: [],
  visualizerOptions: [],
});

export function useSandboxComponents() {
  return useContext(BuiltInComponentsContext);
}

type SandboxComponentsProviderProps = {
  children: React.ReactNode;
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogGroup<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

export default function SandboxComponentsProvider({
  children,
  builtInAdapterOptions,
  builtInAlgorithmOptions,
  builtInBoxOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
}: SandboxComponentsProviderProps) {
  const { data: savedAdapterOptions } = useSavedAdaptersQuery();
  const { data: savedAlgorithmOptions } = useSavedAlgorithmsQuery();
  const { data: savedBoxOptions } = useSavedBoxesQuery();
  const { data: savedProblemOptions } = useSavedProblemsQuery();
  const { data: savedVisualizerOptions } = useSavedVisualizersQuery();

  const adapterOptions = useMemo(() => {
    return [
      ...builtInAdapterOptions,
      {
        key: 'custom',
        label: 'Custom',
        options: (savedAdapterOptions ?? []).map((object) => ({
          key: object.key,
          label: object.name,
          value: object,
          type: 'custom',
        })),
      },
    ] as Array<CatalogGroup<DbAdapterSaved>>;
  }, [builtInAdapterOptions, savedAdapterOptions]);

  const algorithmOptions = useMemo(() => {
    return [
      ...builtInAlgorithmOptions,
      {
        key: 'custom',
        label: 'Custom',
        options: (savedAlgorithmOptions ?? []).map((object) => ({
          key: object.key,
          label: object.name,
          value: object,
          type: 'custom',
        })),
      },
    ] as Array<CatalogGroup<DbAlgorithmSaved>>;
  }, [builtInAlgorithmOptions, savedAlgorithmOptions]);

  const boxOptions = useMemo(() => {
    return [
      ...builtInBoxOptions,
      {
        key: 'custom',
        label: 'Custom',
        options: (savedBoxOptions ?? []).map((object) => ({
          key: object.key,
          label: object.name,
          value: object,
          type: 'custom',
        })),
      },
    ] as Array<CatalogGroup<DbBoxSaved>>;
  }, [builtInBoxOptions, savedBoxOptions]);

  const problemOptions = useMemo(() => {
    return [
      ...builtInProblemOptions,
      {
        key: 'custom',
        label: 'Custom',
        options: (savedProblemOptions ?? []).map((object) => ({
          key: object.key,
          label: object.name,
          value: object,
          type: 'custom',
        })),
      },
    ] as Array<CatalogGroup<DbProblemSaved>>;
  }, [builtInProblemOptions, savedProblemOptions]);

  const visualizerOptions = useMemo(() => {
    return [
      ...builtInVisualizerOptions,
      {
        key: 'custom',
        label: 'Custom',
        options: (savedVisualizerOptions ?? []).map((object) => ({
          key: object.key,
          label: object.name,
          value: object,
          type: 'custom',
        })),
      },
    ] as Array<CatalogGroup<DbVisualizerSaved>>;
  }, [builtInVisualizerOptions, savedVisualizerOptions]);

  const value = useMemo(
    () =>
      ({
        builtInAdapterOptions,
        builtInAlgorithmOptions,
        builtInBoxOptions,
        builtInProblemOptions,
        builtInVisualizerOptions,
        adapterOptions,
        algorithmOptions,
        boxOptions,
        problemOptions,
        visualizerOptions,
      }) satisfies SandboxComponents,
    [
      adapterOptions,
      algorithmOptions,
      boxOptions,
      builtInAdapterOptions,
      builtInAlgorithmOptions,
      builtInBoxOptions,
      builtInProblemOptions,
      builtInVisualizerOptions,
      problemOptions,
      visualizerOptions,
    ],
  );

  return (
    <BuiltInComponentsContext.Provider value={value}>
      {children}
    </BuiltInComponentsContext.Provider>
  );
}
