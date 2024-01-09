import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import BoxTab, { boxTabConfig } from './BoxTab';
import SandboxEnvironmentEditorTab, {
  sandboxEnvironmentEditorTabConfig,
} from './SandboxEnvironmentEditorTab';
import SandboxFlowchartTab, {
  sandboxFlowchartTabConfig,
} from './SandboxFlowchartTab';
import SandboxObjectEditorTab, {
  sandboxObjectEditorTabConfig,
} from './SandboxObjectEditorTab';

export type SandboxTabType = 'box' | 'box-editor' | 'editor' | 'flowchart';

const tabConfigs = {
  box: boxTabConfig,
  'box-editor': sandboxEnvironmentEditorTabConfig,
  editor: sandboxObjectEditorTabConfig,
  flowchart: sandboxFlowchartTabConfig,
} as const satisfies Record<SandboxTabType, unknown>;

export type SandboxBaseTabConfig<T extends SandboxTabType, D = undefined> = {
  type: SandboxTabType;
  icon: string;
  subIcon?: string;
  render: (
    args: {
      context: Omit<TabManager, 'renderTabContent'>;
      tab: Tab<T> & { id: string };
    } & (D extends undefined
      ? unknown
      : {
          data: D;
        }),
  ) => React.ReactNode;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TabFromConfig<C> = C extends SandboxBaseTabConfig<infer T, any>
  ? Tab<T>
  : never;

type TabData<T extends SandboxTabType> =
  (typeof tabConfigs)[T] extends SandboxBaseTabConfig<T, infer D> ? D : never;

export type Tab<T extends SandboxTabType> = {
  type: T;
  label: string;
  closeable?: boolean;
} & (TabData<T> extends undefined
  ? { data?: undefined }
  : { data: TabData<T> });

type SandboxTab =
  | BoxTab
  | SandboxEnvironmentEditorTab
  | SandboxFlowchartTab
  | SandboxObjectEditorTab;

type SandboxTabWithId = SandboxTab & { id: string };

type TabManager = {
  addTab: (tab: SandboxTab) => void;
  addOrFocusTab: (tab: SandboxTab) => void;
  closeTab: (tabId: string) => void;
  selectTab: (tabId: string) => void;
  setTab: (tab: SandboxTabWithId) => void;
  reorderTabs: (srcTabId: string, destTabId: string) => void;
  renderTabContent: (tabId: string) => React.ReactNode;
  tabs: Array<SandboxTabWithId>;
  selectedTabId: string;
};

export const TabManagerContext = createContext<TabManager>({
  addTab: () => {},
  addOrFocusTab: () => {},
  closeTab: () => {},
  selectTab: () => {},
  setTab: () => {},
  renderTabContent: () => null,
  reorderTabs: () => {},
  tabs: [],
  selectedTabId: '',
});

export function useTabManager() {
  return useContext(TabManagerContext);
}

export default function TabManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nextTabId, setNextTabId] = useState<number>(0);
  const [selectedTabId, setSelectedTabId] = useState<string>('current-box');
  const [tabs, setTabs] = useState<Array<SandboxTabWithId>>([
    {
      type: 'box',
      id: 'current-box',
      label: 'Untitled box',
      closeable: false,
    },
  ]);

  const getNewTabId = useCallback(() => {
    const id = nextTabId;
    setNextTabId((id) => id + 1);
    return id.toString();
  }, [nextTabId]);

  const addTab = useCallback(
    (tab: SandboxTab) => {
      const newTabId = getNewTabId();
      setTabs((tabs) => [...tabs, { ...tab, id: newTabId }]);
      setSelectedTabId(newTabId);
    },
    [getNewTabId],
  );

  const addOrFocusTab = useCallback(
    (tab: SandboxTab) => {
      const existingTab = tabs.find((t) => t.type === tab.type);
      if (existingTab !== undefined) {
        setSelectedTabId(existingTab.id);
      } else {
        addTab(tab);
      }
    },
    [addTab, tabs],
  );

  const setTab = useCallback(
    (tab: SandboxTabWithId) => {
      setTabs((tabs) => {
        const newTabs = [...tabs];
        const index = newTabs.findIndex((t) => t.id === tab.id);
        if (index === -1) {
          return newTabs;
        }
        newTabs[index] = tab;
        return newTabs;
      });
    },
    [setTabs],
  );

  const reorderTabs = useCallback((srcTabId: string, destTabId: string) => {
    setTabs((tabs) => {
      const newTabs = [...tabs];

      const srcTabIndex = newTabs.findIndex((tab) => tab.id === srcTabId);
      const destTabIndex = newTabs.findIndex((tab) => tab.id === destTabId);

      const srcTab = newTabs[srcTabIndex];
      newTabs[srcTabIndex] = newTabs[destTabIndex];
      newTabs[destTabIndex] = srcTab;

      return newTabs;
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs((tabs) => tabs.filter((tab) => tab.id !== tabId));
    setSelectedTabId('current-box');
  }, []);

  const value = useMemo(() => {
    return {
      addTab,
      addOrFocusTab,
      closeTab,
      selectTab: setSelectedTabId,
      selectedTabId,
      setTab,
      tabs,
      renderTabContent: (tabId) => {
        const tab = tabs.find((tab) => tab.id === tabId);
        if (tab === undefined) {
          return null;
        }
        return (
          tabConfigs[tab.type] as SandboxBaseTabConfig<SandboxTabType, unknown>
        ).render({
          context: {
            addTab,
            addOrFocusTab,
            closeTab,
            selectTab: setSelectedTabId,
            selectedTabId,
            setTab,
            tabs,
            reorderTabs,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tab: tab as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: tab.data as any,
        });
      },
      reorderTabs,
    } satisfies TabManager;
  }, [
    addOrFocusTab,
    addTab,
    closeTab,
    reorderTabs,
    selectedTabId,
    setTab,
    tabs,
  ]);

  return (
    <TabManagerContext.Provider value={value}>
      {children}
    </TabManagerContext.Provider>
  );
}
