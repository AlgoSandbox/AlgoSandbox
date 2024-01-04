import AlgorithmVisualizerFlowchart from '@components/flowchart/AlgorithmVisualizerFlowchart';
import { DbSandboxObjectSaved } from '@utils/db';
import { useSaveObjectMutation } from '@utils/db/objects';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import BoxEnvironmentEditorPage from '../../app/BoxEnvironmentEditorPage';
import BoxPage from '../../app/BoxPage';
import SandboxObjectEditorPage from '../../app/SandboxObjectEditorPage';

type SandboxEnvironmentEditorTab = {
  type: 'box-editor';
  environment: Record<string, string>;
  label: string;
  icon: 'inventory_2';
  subIcon: 'edit';
  closeable?: boolean;
};

type SandboxFlowchartTab = {
  type: 'flowchart';
  label: string;
  icon: 'schema';
  subIcon?: undefined;
  closeable?: boolean;
};

type SandboxObjectEditorTab = {
  type: 'editor';
  object: DbSandboxObjectSaved;
  label: string;
  icon: 'extension';
  subIcon: 'edit';
  closeable?: boolean;
};

type BoxTab = {
  type: 'box';
  label: string;
  icon: 'inventory_2';
  subIcon?: undefined;
  closeable?: boolean;
};

type SandboxTab =
  | SandboxObjectEditorTab
  | BoxTab
  | SandboxEnvironmentEditorTab
  | SandboxFlowchartTab;
type SandboxTabWithId = SandboxTab & { id: string };

type TabManager = {
  addTab: (tab: SandboxTab) => void;
  addOrFocusTab: (tab: SandboxTab) => void;
  closeTab: (tabId: string) => void;
  selectTab: (tabId: string) => void;
  onTabsReorder: (srcTabId: string, destTabId: string) => void;
  renderTabContent: (tabId: string) => React.ReactNode;
  tabs: Array<SandboxTabWithId>;
  selectedTabId: string;
};

export const TabManagerContext = createContext<TabManager>({
  addTab: () => {},
  addOrFocusTab: () => {},
  closeTab: () => {},
  selectTab: () => {},
  renderTabContent: () => null,
  onTabsReorder: () => {},
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
      icon: 'inventory_2',
      label: 'Untitled box',
      closeable: false,
    },
  ]);

  const getNewTabId = useCallback(() => {
    const id = nextTabId;
    setNextTabId((id) => id + 1);
    return id.toString();
  }, [nextTabId]);

  const { mutateAsync: saveObject } = useSaveObjectMutation();

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

  const renderTab = useCallback(
    (tab: SandboxTabWithId): React.ReactNode => {
      switch (tab.type) {
        case 'box':
          return <BoxPage />;
        case 'box-editor':
          return <BoxEnvironmentEditorPage />;
        case 'editor':
          return (
            <SandboxObjectEditorPage
              object={tab.object}
              onClone={async () => {
                const newObject = await saveObject({
                  ...tab.object,
                  key: undefined,
                  editable: true,
                  name: `${tab.object.name} (copy)`,
                });
                addTab({
                  type: 'editor',
                  icon: 'extension',
                  subIcon: 'edit',
                  object: newObject,
                  label: newObject.name,
                  closeable: true,
                });
              }}
              onSave={async (object) => {
                const newObject = await saveObject(object);
                setTabs((tabs) => {
                  return tabs.map((tab) => {
                    if (tab.id === selectedTabId) {
                      return {
                        id: tab.id,
                        icon: 'extension',
                        subIcon: 'edit',
                        type: 'editor',
                        object: newObject,
                        label: newObject.name,
                        closeable: true,
                      };
                    }
                    return tab;
                  });
                });
              }}
            />
          );
        case 'flowchart':
          return <AlgorithmVisualizerFlowchart />;
      }
    },
    [addTab, saveObject, selectedTabId],
  );

  const onTabsReorder = useCallback((srcTabId: string, destTabId: string) => {
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

  const value = useMemo(
    () =>
      ({
        addTab,
        addOrFocusTab,
        closeTab: (tabId) => {
          setTabs((tabs) => tabs.filter((tab) => tab.id !== tabId));
          setSelectedTabId('current-box');
        },
        selectTab: (tabId) => {
          setSelectedTabId(tabId);
        },
        selectedTabId,
        tabs,
        renderTabContent: (tabId) => {
          const tab = tabs.find((tab) => tab.id === tabId);
          if (tab === undefined) {
            return null;
          }
          return renderTab(tab);
        },
        onTabsReorder,
      }) satisfies TabManager,
    [addOrFocusTab, addTab, onTabsReorder, renderTab, selectedTabId, tabs],
  );

  return (
    <TabManagerContext.Provider value={value}>
      {children}
    </TabManagerContext.Provider>
  );
}
