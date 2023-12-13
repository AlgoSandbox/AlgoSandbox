import { CatalogGroup } from '@constants/catalog';
import { DbAlgorithmSaved, DbProblemSaved, DbVisualizerSaved } from '@utils/db';
import { createContext, useContext } from 'react';

type BuiltInComponentsContextType = {
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

const BuiltInComponentsContext = createContext<BuiltInComponentsContextType>({
  builtInAlgorithmOptions: [],
  builtInProblemOptions: [],
  builtInVisualizerOptions: [],
});

export function useBuiltInComponents() {
  return useContext(BuiltInComponentsContext);
}

type BuiltInComponentsProviderProps = {
  children: React.ReactNode;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
};

export default function BuiltInComponentsProvider({
  children,
  builtInAlgorithmOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
}: BuiltInComponentsProviderProps) {
  return (
    <BuiltInComponentsContext.Provider
      value={{
        builtInAlgorithmOptions,
        builtInProblemOptions,
        builtInVisualizerOptions,
      }}
    >
      {children}
    </BuiltInComponentsContext.Provider>
  );
}
