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
import TabProvider from '@components/tab-manager/TabProvider';
import { Button, MaterialSymbol, Popover, Select } from '@components/ui';
import Heading, { HeadingContextProvider } from '@components/ui/Heading';
import { Tabs, TabsItem } from '@components/ui/Tabs';
import Toggle from '@components/ui/Toggle';
import { CatalogGroup } from '@constants/catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DbAdapterSaved,
  DbAlgorithmSaved,
  DbBoxSaved,
  DbProblemSaved,
  DbVisualizerSaved,
} from '@utils/db';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import BoxManagerProvider from './BoxManager';
import { TypeDeclaration } from './page';

const queryClient = new QueryClient();

type PlaygroundProps = {
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInBoxOptions: Array<CatalogGroup<DbBoxSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
};

const themeOptions = [
  { label: 'System', key: 'system', value: 'system' },
  { label: 'Light', key: 'light', value: 'light' },
  { label: 'Dark', key: 'dark', value: 'dark' },
];

export function PlaygroundPage() {
  const { theme, setTheme } = useTheme();
  const selectedThemeOption = useMemo(() => {
    return themeOptions.find((option) => option.value === theme);
  }, [theme]);
  const { isAdvancedModeEnabled, setAdvancedModeEnabled } =
    useUserPreferences();

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
        <Popover
          content={
            <div className="bg-surface p-2 flex flex-col gap-4 items-start">
              <Heading variant="h4">Settings</Heading>
              <Select
                options={themeOptions}
                value={selectedThemeOption}
                onChange={(option) => {
                  setTheme(option.value);
                }}
                label="Theme"
              />
              <Toggle
                className="mb-2"
                label="Advanced mode"
                value={isAdvancedModeEnabled}
                onChange={setAdvancedModeEnabled}
              />
            </div>
          }
        >
          <div className="border-b">
            <Button
              label="Settings"
              icon={<MaterialSymbol icon="settings" />}
            />
          </div>
        </Popover>
      </div>
      {tabs.map((tab) => (
        <TabProvider key={tab.id} tab={tab}>
          <main
            className={clsx('flex-1', tab.id !== selectedTabId && 'hidden')}
          >
            {renderTabContent(tab.id)}
          </main>
        </TabProvider>
      ))}
    </div>
  );
}

export default function Playground({
  builtInAdapterOptions,
  builtInAlgorithmOptions,
  builtInBoxOptions,
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
                builtInBoxOptions={builtInBoxOptions}
                builtInProblemOptions={builtInProblemOptions}
                builtInVisualizerOptions={builtInVisualizerOptions}
              >
                <BoxManagerProvider>
                  <TabManagerProvider>
                    <PlaygroundPage />
                  </TabManagerProvider>
                </BoxManagerProvider>
              </BuiltInComponentsProvider>
            </DndProvider>
          </AlgoSandboxEditorFilesContextProvider>
        </HeadingContextProvider>
      </UserPreferencesProvider>
    </QueryClientProvider>
  );
}
