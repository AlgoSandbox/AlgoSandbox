import { CatalogGroup } from '@constants/catalog';
import {
  DbAdapterSaved,
  DbAlgorithmSaved,
  DbProblemSaved,
  DbVisualizerSaved,
} from '@utils/db';
import { createContext, useContext } from 'react';

type BuiltInComponentsContextType = {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

const BuiltInComponentsContext = createContext<BuiltInComponentsContextType>({
  builtInAdapterOptions: [],
  builtInAlgorithmOptions: [],
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
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

export default function BuiltInComponentsProvider({
  children,
  builtInAdapterOptions,
  builtInAlgorithmOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
}: BuiltInComponentsProviderProps) {
  return (
    <BuiltInComponentsContext.Provider
      value={{
        builtInAdapterOptions,
        builtInAlgorithmOptions,
        builtInProblemOptions,
        builtInVisualizerOptions,
      }}
    >
      {children}
    </BuiltInComponentsContext.Provider>
  );
}
