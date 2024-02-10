'use client';

import { SandboxStateType } from '@algo-sandbox/core';
import AppNavBar from '@components/AppNavBar';
import {
  BoxControlsContextProvider,
  BoxExecutionControls,
  BoxPageShortcuts,
  useBoxContext,
} from '@components/box-page';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import TabProvider from '@components/tab-manager/TabProvider';
import { Button, MaterialSymbol, Popover, Select } from '@components/ui';
import Heading from '@components/ui/Heading';
import Toggle from '@components/ui/Toggle';
import { TabsItem, VerticalTabs } from '@components/ui/VerticalTabs';
import { createScene, SandboxScene } from '@utils';
import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const themeOptions = [
  { label: 'System', key: 'system', value: 'system' },
  { label: 'Light', key: 'light', value: 'light' },
  { label: 'Dark', key: 'dark', value: 'dark' },
];

function BoxPageExecutionWrapper({ children }: { children: React.ReactNode }) {
  const { compatible: areAlgorithmProblemCompatible } =
    useBoxContext('problemAlgorithm');
  const problemInstance = useBoxContext('problem.instance');
  const algorithmInstance = useBoxContext('algorithm.instance');

  const initialScene = useMemo(() => {
    if (
      areAlgorithmProblemCompatible &&
      algorithmInstance !== null &&
      problemInstance !== null
    ) {
      try {
        const scene = createScene({
          algorithm: algorithmInstance,
          problem: problemInstance,
        });

        return scene.copyWithExecution(1);
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }, [areAlgorithmProblemCompatible, algorithmInstance, problemInstance]);
  const [scene, setScene] = useState(initialScene);

  useEffect(() => {
    setScene(initialScene);
  }, [initialScene]);

  const isFullyExecuted = useMemo(
    () => scene?.isFullyExecuted ?? false,
    [scene],
  );

  return (
    <BoxControlsContextProvider
      scene={scene}
      onSceneChange={setScene}
      maxSteps={isFullyExecuted ? scene!.executionTrace.length : null}
    >
      <BoxPageShortcuts>
        <SceneProvider scene={scene}>{children}</SceneProvider>
      </BoxPageShortcuts>
    </BoxControlsContextProvider>
  );
}

type SceneContextType = {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
};
const SceneContext = createContext<SceneContextType>({
  scene: null,
});

function SceneProvider({
  scene,
  children,
}: {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ scene }), [scene]);
  return (
    <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
  );
}

export function useScene() {
  return useContext(SceneContext).scene;
}

function BoxPageImpl() {
  const boxKey = useSearchParams().get('key') ?? '';
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const selectedThemeOption = useMemo(() => {
    return themeOptions.find((option) => option.value === theme);
  }, [theme]);
  const {
    isAdvancedModeEnabled,
    setAdvancedModeEnabled,
    isBoxComponentsShown,
    setBoxComponentsShown,
  } = useUserPreferences();
  const { isDraft, reset, openBoxEditor } = useBoxContext();
  const { builtInBoxOptions } = useBuiltInComponents();

  const selectedOption = useMemo(() => {
    const flattenedOptions = builtInBoxOptions.flatMap(
      (group) => group.options,
    );
    return flattenedOptions.find((option) => option.key === boxKey);
  }, [builtInBoxOptions, boxKey]);

  const {
    selectedTabId,
    tabs,
    renderTabContent,
    reorderTabs,
    closeTab,
    selectTab,
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
      <AppNavBar>
        <div className="flex justify-between flex-1 px-2">
          <div className="flex items-center gap-2 pe-4 py-2">
            <CatalogSelect
              containerClassName="shrink"
              options={builtInBoxOptions}
              label="Select box"
              hideLabel={true}
              variant="primary"
              value={selectedOption}
              onChange={(option) => {
                router.push(`/box?key=${option.key}`);
              }}
            />
            <div className="flex gap-2 min-w-0">
              <Button
                label="Customize"
                className="min-w-0"
                variant={isBoxComponentsShown ? 'primary' : 'filled'}
                hideLabel={true}
                onClick={() => {
                  setBoxComponentsShown(!isBoxComponentsShown);
                }}
                icon={<MaterialSymbol icon="tune" />}
              />
              {!isDraft && (
                <Button
                  label="Reset box"
                  hideLabel={true}
                  variant="filled"
                  onClick={reset}
                  icon={<MaterialSymbol icon="settings_backup_restore" />}
                />
              )}
              {isAdvancedModeEnabled && !isDraft && (
                <Button
                  label="Edit box"
                  hideLabel={true}
                  variant="filled"
                  onClick={openBoxEditor}
                  icon={<MaterialSymbol icon="open_in_new" />}
                />
              )}
            </div>
          </div>
          <div className="hidden lg:flex items-center">
            <BoxExecutionControls />
          </div>
        </div>
      </AppNavBar>
      <div className="flex flex-1">
        <div className="flex flex-col items-stretch h-full justify-between border-e">
          <VerticalTabs
            tabs={tabItems}
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
              <div className="bg-surface p-4 flex flex-col gap-4 items-start">
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
            <Button
              hideLabel={true}
              size="lg"
              label="Settings"
              icon={<MaterialSymbol icon="settings" />}
            />
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
      <div className="flex justify-center items-center py-2 lg:hidden">
        <BoxExecutionControls />
      </div>
    </div>
  );
}

export default function BoxPage() {
  return (
    <BoxPageExecutionWrapper>
      <BoxPageImpl />
    </BoxPageExecutionWrapper>
  );
}
