import { Button, MaterialSymbol } from '@components/ui';
import { TabsItem, VerticalTabs } from '@components/ui/VerticalTabs';

interface BoxPageSidebarProps {
  tabItems: TabsItem[];
  reorderTabs: (srcTabId: string, destTabId: string) => void;
  selectTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  setShowSettings: (show: boolean) => void;
}

export function BoxPageSidebar({
  tabItems,
  reorderTabs,
  selectTab,
  closeTab,
  setShowSettings,
}: BoxPageSidebarProps) {
  return (
    <div className="hidden flex-col items-stretch h-full lg:flex justify-between border-e">
      <VerticalTabs
        showLabels={false}
        draggable={true}
        tabs={tabItems}
        onTabsReorder={reorderTabs}
        onTabSelect={(tab) => {
          selectTab(tab.key);
        }}
        onTabClose={(tab) => {
          closeTab(tab.key);
        }}
      />
      <Button
        hideLabel={true}
        size="lg"
        label="Settings"
        icon={<MaterialSymbol icon="settings" />}
        onClick={() => {
          setShowSettings(true);
        }}
      />
    </div>
  );
}
