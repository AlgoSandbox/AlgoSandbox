'use client';

import AppLogo from '@components/AppLogo';
import AlgoSandboxEditorFilesContextProvider from '@components/editor/AlgoSandboxEditorFilesContextProvider';
import BuiltInComponentsProvider from '@components/playground/BuiltInComponentsProvider';
import UserPreferencesProvider, {
  useUserPreferences,
} from '@components/preferences/UserPreferencesProvider';
import { Tabs, TabsItem } from '@components/ui/Tabs';
import { CatalogGroup } from '@constants/catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DbAlgorithmSaved, DbProblemSaved, DbVisualizerSaved } from '@utils/db';
import { useState } from 'react';

import BoxPage from './BoxPage';
import { TypeDeclaration } from './page';

const queryClient = new QueryClient();

type PlaygroundProps = {
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
};

// TODO: Update with more appropriate values
const initialTabs: Array<TabsItem> = [
  {
    key: 'current-box',
    label: 'Untitled box',
    isSelected: true,
    closeable: false,
  },
  {
    key: 'editor',
    label: 'Problem: Ten nodes',
    isSelected: false,
  },
];

export function PlaygroundPage() {
  const { isAdvancedModeEnabled } = useUserPreferences();
  const [tabs, setTabs] = useState(initialTabs);

  return (
    <div className="flex flex-col h-screen">
      {isAdvancedModeEnabled && (
        <div className="flex">
          <div className="border-b py-2 px-4">
            <AppLogo />
          </div>
          <Tabs tabs={tabs} onTabsChange={setTabs} />
        </div>
      )}
      <main className="flex-1">
        <BoxPage />
      </main>
    </div>
  );
}

export default function Playground({
  builtInAlgorithmOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
  algoSandboxFiles,
  typeDeclarations,
}: PlaygroundProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPreferencesProvider>
        <AlgoSandboxEditorFilesContextProvider
          algoSandboxFiles={algoSandboxFiles}
          typeDeclarations={typeDeclarations}
        >
          <BuiltInComponentsProvider
            builtInAlgorithmOptions={builtInAlgorithmOptions}
            builtInProblemOptions={builtInProblemOptions}
            builtInVisualizerOptions={builtInVisualizerOptions}
          >
            <PlaygroundPage />
          </BuiltInComponentsProvider>
        </AlgoSandboxEditorFilesContextProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}
