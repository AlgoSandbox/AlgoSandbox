import { CatalogGroup } from '@constants/catalog';
import {
  DbAdapterSaved,
  DbAlgorithmSaved,
  DbBoxSaved,
  DbProblemSaved,
  DbVisualizerSaved,
} from '@utils/db';
import { createContext, useContext } from 'react';

export type BuiltInComponents = {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogGroup<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

const BuiltInComponentsContext = createContext<BuiltInComponents>({
  builtInAdapterOptions: [],
  builtInAlgorithmOptions: [],
  builtInBoxOptions: [],
  builtInProblemOptions: [],
  builtInVisualizerOptions: [],
});

export function useBuiltInComponents() {
  return useContext(BuiltInComponentsContext);
}

type BuiltInComponentsProviderProps = {
  children: React.ReactNode;
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogGroup<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

export default function BuiltInComponentsProvider({
  children,
  builtInAdapterOptions,
  builtInAlgorithmOptions,
  builtInBoxOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
}: BuiltInComponentsProviderProps) {
  return (
    <BuiltInComponentsContext.Provider
      value={{
        builtInAdapterOptions,
        builtInAlgorithmOptions,
        builtInBoxOptions,
        builtInProblemOptions,
        builtInVisualizerOptions,
      }}
    >
      {children}
    </BuiltInComponentsContext.Provider>
  );
}
