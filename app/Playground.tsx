'use client';

import AppLogo from '@components/AppLogo';
import AlgoSandboxEditorFilesContextProvider from '@components/editor/AlgoSandboxEditorFilesContextProvider';
import BuiltInComponentsProvider from '@components/playground/BuiltInComponentsProvider';
import UserPreferencesProvider, {
  useUserPreferences,
} from '@components/preferences/UserPreferencesProvider';
import TabManagerProvider, {
  useTabManager,
} from '@components/tab-manager/TabManager';
import { Tabs, TabsItem } from '@components/ui/Tabs';
import { CatalogGroup } from '@constants/catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DbAlgorithmSaved, DbProblemSaved, DbVisualizerSaved } from '@utils/db';
import clsx from 'clsx';
import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { TypeDeclaration } from './page';

const queryClient = new QueryClient();

type PlaygroundProps = {
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
};

export function PlaygroundPage() {
  const { isAdvancedModeEnabled } = useUserPreferences();
  const {
    selectedTabId,
    tabs,
    renderTabContent,
    onTabsReorder,
    closeTab,
    selectTab,
  } = useTabManager();

  const tabItems = useMemo(() => {
    return tabs.map(
      (tab) =>
        ({
          key: tab.id,
          label: tab.label,
          isSelected: tab.id === selectedTabId,
          closeable: tab.closeable,
        }) satisfies TabsItem,
    );
  }, [selectedTabId, tabs]);

  return (
    <div className="flex flex-col h-screen">
      {isAdvancedModeEnabled && (
        <div className="flex">
          <div className="border-b py-2 px-4">
            <AppLogo />
          </div>
          <Tabs
            tabs={tabItems}
            onTabsReorder={onTabsReorder}
            onTabSelect={(tab) => {
              selectTab(tab.key);
            }}
            onTabClose={(tab) => {
              closeTab(tab.key);
            }}
          />
        </div>
      )}
      {tabs.map((tab) => (
        <main
          key={tab.id}
          className={clsx('flex-1', tab.id !== selectedTabId && 'hidden')}
        >
          {renderTabContent(tab.id)}
        </main>
      ))}
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
          <DndProvider backend={HTML5Backend}>
            <BuiltInComponentsProvider
              builtInAlgorithmOptions={builtInAlgorithmOptions}
              builtInProblemOptions={builtInProblemOptions}
              builtInVisualizerOptions={builtInVisualizerOptions}
            >
              <TabManagerProvider>
                <PlaygroundPage />
              </TabManagerProvider>
            </BuiltInComponentsProvider>
          </DndProvider>
        </AlgoSandboxEditorFilesContextProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}
