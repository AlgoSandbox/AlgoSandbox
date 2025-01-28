'use client';

import DrawerItem from '@components/DrawerItem';
import { TabsItem, VerticalTabs } from '@components/ui/VerticalTabs';

interface BoxPageNavbarProps {
  hasBox: boolean;
  isBoxCustom: boolean;
  handleCopyLinkClick: () => void;
  handleSaveClick: () => void;
  handleDeleteClick: () => void;
  tabItems: TabsItem[];
  reorderTabs: (srcTabId: string, destTabId: string) => void;
  selectTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  setShowSettings: (show: boolean) => void;
}

export function BoxPageNavbar({
  hasBox,
  isBoxCustom,
  handleCopyLinkClick,
  handleSaveClick,
  handleDeleteClick,
  tabItems,
  reorderTabs,
  selectTab,
  closeTab,
  setShowSettings,
}: BoxPageNavbarProps) {
  return (
    <div>
      {hasBox && (
        <div className="border-t border-b flex flex-col md:hidden">
          {!isBoxCustom && (
            <DrawerItem
              label="Copy link"
              onClick={handleCopyLinkClick}
              icon="link"
            />
          )}
          <DrawerItem label="Save" onClick={handleSaveClick} icon="save" />
          {isBoxCustom && (
            <DrawerItem
              label="Delete"
              onClick={handleDeleteClick}
              icon="delete"
            />
          )}
        </div>
      )}
      <VerticalTabs
        showLabels={true}
        draggable={false}
        tabs={tabItems}
        onTabsReorder={reorderTabs}
        onTabSelect={(tab) => {
          selectTab(tab.key);
        }}
        onTabClose={(tab) => {
          closeTab(tab.key);
        }}
      />
      <div className="border-t">
        <DrawerItem
          label="Settings"
          onClick={() => {
            setShowSettings(true);
          }}
          icon="settings"
        />
      </div>
    </div>
  );
}
