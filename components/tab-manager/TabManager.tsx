import { isEqual } from 'lodash';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { boxConfigFlowchartTabConfig } from './BoxConfigFlowchartTab';
import { boxTabConfig } from './BoxTab';
import { newTabConfig } from './NewTab';
import { sandboxObjectEditorTabConfig } from './SandboxObjectEditorTab';

export type SandboxTabType = 'new-tab' | 'box' | 'editor' | 'flowchart';

const tabConfigs = {
  box: boxTabConfig,
  editor: sandboxObjectEditorTabConfig,
  flowchart: boxConfigFlowchartTabConfig,
  'new-tab': newTabConfig,
} as const satisfies Record<SandboxTabType, unknown>;

export type SandboxBaseTabConfig<T extends SandboxTabType, D = undefined> = {
  type: T;
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

type SandboxTab = {
  [K in SandboxTabType]: Tab<K>;
}[SandboxTabType];

export type SandboxTabWithId = SandboxTab & {
  id: string;
};

type SandboxTabInstance = SandboxTabWithId & {
  id: string;
  icon: string;
  subIcon?: string;
};

type TabManager = {
  addTab: (tab: SandboxTab) => void;
  addOrFocusTab: (tab: SandboxTab) => void;
  closeTab: (tabId: string) => void;
  renameTab: (tabId: string, newName: string) => void;
  selectTab: (tabId: string) => void;
  setTab: (tab: SandboxTabWithId) => void;
  reorderTabs: (srcTabId: string, destTabId: string) => void;
  renderTabContent: (tabId: string) => React.ReactNode;
  tabs: Array<SandboxTabInstance>;
  selectedTabId: string;
};

export const TabManagerContext = createContext<TabManager>({
  addTab: () => {},
  addOrFocusTab: () => {},
  closeTab: () => {},
  renameTab: () => {},
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
  defaultTabs = [],
  defaultSelectedTabId = 'default',
}: {
  children: React.ReactNode;
  defaultTabs?: Array<SandboxTabWithId>;
  defaultSelectedTabId?: string;
}) {
  const [nextTabId, setNextTabId] = useState<number>(0);
  const [selectedTabId, setSelectedTabId] =
    useState<string>(defaultSelectedTabId);
  const [tabs, setTabs] = useState<Array<SandboxTabWithId>>(
    defaultTabs ?? [
      {
        id: 'default',
        type: 'new-tab',
        label: 'New tab',
      },
    ],
  );

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
      const existingTab = tabs.find(
        (t) => t.type === tab.type && isEqual(t.data, tab.data),
      );
      if (existingTab !== undefined) {
        setSelectedTabId(existingTab.id);
      } else {
        addTab(tab);
      }
    },
    [addTab, tabs],
  );

  const renameTab = useCallback(
    (tabId: string, newName: string) => {
      setTabs(
        tabs.map((tab) => {
          if (tab.id === tabId) {
            return {
              ...tab,
              label: newName,
            };
          }
          return tab;
        }),
      );
    },
    [tabs],
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

  const closeTab = useCallback(
    (tabId: string) => {
      const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(newTabs);
      if (selectedTabId === tabId) {
        setSelectedTabId(
          newTabs[tabIndex - 1]?.id ?? newTabs[tabIndex]?.id ?? 'current-box',
        );
      }
    },
    [tabs, selectedTabId],
  );

  const value = useMemo(() => {
    const valueTabs = tabs.map((tab) => ({
      ...tab,
      icon: tabConfigs[tab.type].icon,
      subIcon: tabConfigs[tab.type].subIcon,
    }));

    return {
      addTab,
      addOrFocusTab,
      closeTab,
      selectTab: setSelectedTabId,
      selectedTabId,
      setTab,
      tabs: valueTabs,
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
            renameTab,
            closeTab,
            selectTab: setSelectedTabId,
            selectedTabId,
            setTab,
            tabs: valueTabs,
            reorderTabs,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tab: tab as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: tab.data as any,
        });
      },
      renameTab,
      reorderTabs,
    } satisfies TabManager;
  }, [
    addOrFocusTab,
    addTab,
    closeTab,
    renameTab,
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
