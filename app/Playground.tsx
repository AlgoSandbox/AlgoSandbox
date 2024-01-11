'use client';

import AppLogo from '@components/AppLogo';
import { BoxContextProvider } from '@components/box-page';
import AlgoSandboxEditorFilesContextProvider from '@components/editor/AlgoSandboxEditorFilesContextProvider';
import BuiltInComponentsProvider from '@components/playground/BuiltInComponentsProvider';
import UserPreferencesProvider from '@components/preferences/UserPreferencesProvider';
import TabManagerProvider, {
  useTabManager,
} from '@components/tab-manager/TabManager';
import { HeadingContextProvider } from '@components/ui/Heading';
import { Tabs, TabsItem } from '@components/ui/Tabs';
import { CatalogGroup } from '@constants/catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DbAdapterSaved,
  DbAlgorithmSaved,
  DbProblemSaved,
  DbVisualizerSaved,
} from '@utils/db';
import clsx from 'clsx';
import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { TypeDeclaration } from './page';

const queryClient = new QueryClient();

type PlaygroundProps = {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
};

export function PlaygroundPage() {
  const {
    selectedTabId,
    tabs,
    renderTabContent,
    reorderTabs,
    closeTab,
    selectTab,
    addTab,
  } = useTabManager();

  const tabItems = useMemo(() => {
    return tabs.map(
      (tab) =>
        ({
          key: tab.id,
          label: tab.label,
          icon: tab.icon,
          subIcon: tab.subIcon,
          isSelected: tab.id === selectedTabId,
          closeable: tab.closeable,
        }) satisfies TabsItem,
    );
  }, [selectedTabId, tabs]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex sticky top-0 bg-canvas z-10">
        <div className="border-b py-2 px-4">
          <AppLogo />
        </div>
        <Tabs
          tabs={tabItems}
          onNewTabOpen={() => {
            addTab({
              type: 'new-tab',
              label: 'New tab',
            });
          }}
          onTabsReorder={reorderTabs}
          onTabSelect={(tab) => {
            selectTab(tab.key);
          }}
          onTabClose={(tab) => {
            closeTab(tab.key);
          }}
        />
      </div>
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
  builtInAdapterOptions,
  builtInAlgorithmOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
  algoSandboxFiles,
  typeDeclarations,
}: PlaygroundProps) {
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
                builtInProblemOptions={builtInProblemOptions}
                builtInVisualizerOptions={builtInVisualizerOptions}
              >
                <TabManagerProvider>
                  <BoxContextProvider>
                    <PlaygroundPage />
                  </BoxContextProvider>
                </TabManagerProvider>
              </BuiltInComponentsProvider>
            </DndProvider>
          </AlgoSandboxEditorFilesContextProvider>
        </HeadingContextProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}
