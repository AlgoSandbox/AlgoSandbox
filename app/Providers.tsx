'use client';

import AlgoSandboxEditorFilesContextProvider from '@components/editor/AlgoSandboxEditorFilesContextProvider';
import BuiltInComponentsProvider from '@components/playground/BuiltInComponentsProvider';
import UserPreferencesProvider from '@components/preferences/UserPreferencesProvider';
import { HeadingContextProvider } from '@components/ui/Heading';
import { CatalogGroup } from '@constants/catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DbAdapterSaved,
  DbAlgorithmSaved,
  DbBoxSaved,
  DbProblemSaved,
  DbVisualizerSaved,
} from '@utils/db';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { TypeDeclaration } from './layout';

const queryClient = new QueryClient();

type ProvidersProps = {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogGroup<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
  children: React.ReactNode;
};

export default function Providers({
  builtInAdapterOptions,
  builtInAlgorithmOptions,
  builtInBoxOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
  algoSandboxFiles,
  typeDeclarations,
  children,
}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider>
        <HeadingContextProvider>
          <AlgoSandboxEditorFilesContextProvider
            algoSandboxFiles={algoSandboxFiles}
            typeDeclarations={typeDeclarations}
          >
            <DndProvider backend={HTML5Backend}>
              <BuiltInComponentsProvider
                builtInAdapterOptions={builtInAdapterOptions}
                builtInAlgorithmOptions={builtInAlgorithmOptions}
                builtInBoxOptions={builtInBoxOptions}
                builtInProblemOptions={builtInProblemOptions}
                builtInVisualizerOptions={builtInVisualizerOptions}
              >
                {children}
              </BuiltInComponentsProvider>
            </DndProvider>
          </AlgoSandboxEditorFilesContextProvider>
        </HeadingContextProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}
