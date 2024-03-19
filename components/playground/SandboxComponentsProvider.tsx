import { CatalogOption } from '@constants/catalog';
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
  builtInAdapterOptions: Array<CatalogOption<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogOption<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogOption<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogOption<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogOption<DbVisualizerSaved>>;
  adapterOptions: Array<CatalogOption<DbAdapterSaved>>;
  algorithmOptions: Array<CatalogOption<DbAlgorithmSaved>>;
  boxOptions: Array<CatalogOption<DbBoxSaved>>;
  problemOptions: Array<CatalogOption<DbProblemSaved>>;
  visualizerOptions: Array<CatalogOption<DbVisualizerSaved>>;
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
  builtInAdapterOptions: Array<CatalogOption<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogOption<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogOption<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogOption<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogOption<DbVisualizerSaved>>;
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
      ...(savedAdapterOptions ?? []).map((object) => ({
        key: object.key,
        label: object.name,
        value: object,
        type: 'custom',
      })),
    ] as Array<CatalogOption<DbAdapterSaved>>;
  }, [builtInAdapterOptions, savedAdapterOptions]);

  const algorithmOptions = useMemo(() => {
    return [
      ...builtInAlgorithmOptions,
      ...(savedAlgorithmOptions ?? []).map((object) => ({
        key: object.key,
        label: object.name,
        value: object,
        type: 'custom',
      })),
    ] as Array<CatalogOption<DbAlgorithmSaved>>;
  }, [builtInAlgorithmOptions, savedAlgorithmOptions]);

  const boxOptions = useMemo(() => {
    return [
      ...builtInBoxOptions,
      ...(savedBoxOptions ?? []).map((object) => ({
        key: object.key,
        label: object.name,
        value: object,
        type: 'custom',
      })),
    ] as Array<CatalogOption<DbBoxSaved>>;
  }, [builtInBoxOptions, savedBoxOptions]);

  const problemOptions = useMemo(() => {
    return [
      ...builtInProblemOptions,
      ...(savedProblemOptions ?? []).map((object) => ({
        key: object.key,
        label: object.name,
        value: object,
        type: 'custom',
      })),
    ] as Array<CatalogOption<DbProblemSaved>>;
  }, [builtInProblemOptions, savedProblemOptions]);

  const visualizerOptions = useMemo(() => {
    return [
      ...builtInVisualizerOptions,
      ...(savedVisualizerOptions ?? []).map((object) => ({
        key: object.key,
        label: object.name,
        value: object,
        type: 'custom',
      })),
    ] as Array<CatalogOption<DbVisualizerSaved>>;
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
