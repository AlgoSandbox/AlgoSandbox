'use client';

import AlgoSandboxEditorFilesContextProvider from '@components/editor/AlgoSandboxEditorFilesContextProvider';
import SandboxComponentsProvider from '@components/playground/SandboxComponentsProvider';
import UserPreferencesProvider from '@components/preferences/UserPreferencesProvider';
import { HeadingContextProvider } from '@components/ui/Heading';
import { CatalogOption } from '@constants/catalog';
import { TooltipProvider } from '@radix-ui/react-tooltip';
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
  builtInAdapterOptions: Array<CatalogOption<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogOption<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogOption<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogOption<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogOption<DbVisualizerSaved>>;
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
        <TooltipProvider delayDuration={500} skipDelayDuration={500}>
          <HeadingContextProvider>
            <AlgoSandboxEditorFilesContextProvider
              algoSandboxFiles={algoSandboxFiles}
              typeDeclarations={typeDeclarations}
            >
              <DndProvider backend={HTML5Backend}>
                <SandboxComponentsProvider
                  builtInAdapterOptions={builtInAdapterOptions}
                  builtInAlgorithmOptions={builtInAlgorithmOptions}
                  builtInBoxOptions={builtInBoxOptions}
                  builtInProblemOptions={builtInProblemOptions}
                  builtInVisualizerOptions={builtInVisualizerOptions}
                >
                  {children}
                </SandboxComponentsProvider>
              </DndProvider>
            </AlgoSandboxEditorFilesContextProvider>
          </HeadingContextProvider>
        </TooltipProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}
