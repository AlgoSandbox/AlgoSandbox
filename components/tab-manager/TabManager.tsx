import { DbSandboxObjectSaved } from '@utils/db';
import { useSaveObjectMutation } from '@utils/db/objects';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import BoxPage from '../../app/BoxPage';
import SandboxObjectEditorPage from '../../app/SandboxObjectEditorPage';

type SandboxObjectEditorTab = {
  type: 'editor';
  object: DbSandboxObjectSaved;
  label: string;
  closeable?: boolean;
};

type BoxTab = {
  type: 'box';
  label: string;
  closeable?: boolean;
};

type SandboxTab = SandboxObjectEditorTab | BoxTab;
type SandboxTabWithId = SandboxTab & { id: string };

type TabManager = {
  addTab: (tab: SandboxTab) => void;
  closeTab: (tabId: string) => void;
  selectTab: (tabId: string) => void;
  onTabsReorder: (srcTabId: string, destTabId: string) => void;
  renderTabContent: (tabId: string) => React.ReactNode;
  tabs: Array<SandboxTabWithId>;
  selectedTabId: string;
};

export const TabManagerContext = createContext<TabManager>({
  addTab: () => {},
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

  const renderTab = useCallback(
    (tab: SandboxTabWithId): React.ReactNode => {
      switch (tab.type) {
        case 'box':
          return <BoxPage />;
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
        addTab: addTab,
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
    [addTab, onTabsReorder, renderTab, selectedTabId, tabs],
  );

  return (
    <TabManagerContext.Provider value={value}>
      {children}
    </TabManagerContext.Provider>
  );
}
