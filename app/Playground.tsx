'use client';

import AppLogo from '@components/AppLogo';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import TabManagerProvider, {
  useTabManager,
} from '@components/tab-manager/TabManager';
import TabProvider from '@components/tab-manager/TabProvider';
import {
  Button,
  MaterialSymbol,
  Popover,
  ResizeHandle,
  Select,
} from '@components/ui';
import Heading from '@components/ui/Heading';
import Toggle from '@components/ui/Toggle';
import { TabsItem, VerticalTabs } from '@components/ui/VerticalTabs';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import BoxManagerProvider from './BoxManager';

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
      <div className="flex sticky top-0 bg-canvas justify-between z-10">
        <div className="border-b flex items-center gap-2 px-4 py-2">
          <AppLogo />
          <Button
            className="ms-2"
            variant="primary"
            label="Breadth-first-search"
            icon={<MaterialSymbol icon="inventory_2" />}
            endIcon={<MaterialSymbol icon="arrow_drop_down" />}
          />
        </div>
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
          <div className="border-b">
            <Button
              label="Settings"
              icon={<MaterialSymbol icon="settings" />}
            />
          </div>
        </Popover>
      </div>
      <div className="flex flex-1">
        <PanelGroup direction="horizontal">
          <Panel>
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
          </Panel>
          <ResizeHandle />
          <Panel className="flex h-full">
            {tabs.map((tab) => (
              <TabProvider key={tab.id} tab={tab}>
                <main
                  className={clsx(
                    'flex-1',
                    tab.id !== selectedTabId && 'hidden',
                  )}
                >
                  {renderTabContent(tab.id)}
                </main>
              </TabProvider>
            ))}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default function Playground() {
  return (
    <BoxManagerProvider>
      <TabManagerProvider>
        <PlaygroundPage />
      </TabManagerProvider>
    </BoxManagerProvider>
  );
}
