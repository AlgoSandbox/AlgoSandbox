'use client';

import AppNavBar from '@components/AppNavBar';
import { BoxExecutionControls, useBoxContext } from '@components/box-page';
import { SaveBoxDialog } from '@components/box-page/SaveBoxDialog';
import SettingsDialog from '@components/common/SettingsDialog';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import TabProvider from '@components/tab-manager/TabProvider';
import { TabsItem } from '@components/ui/VerticalTabs';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { BoxPageExecutionWrapper } from './BoxPageExecutionWrapper';
import { BoxPageHeader } from './BoxPageHeader';
import { BoxPageNavbar } from './BoxPageNavbar';
import { BoxPageSidebar } from './BoxPageSidebar';

function BoxPageImpl() {
  const boxKey = useSearchParams().get('box') ?? '';
  const router = useRouter();
  const { isBoxCustom, delete: deleteBox } = useBoxContext();
  const { boxOptions } = useSandboxComponents();
  const groupedBoxOptions = useMemo(() => {
    return groupOptionsByTag(boxOptions, { omitTags: ['box'] });
  }, [boxOptions]);

  const selectedOption = useMemo(() => {
    return boxOptions.find((option) => option.value.key === boxKey);
  }, [boxOptions, boxKey]);

  const hasBox = selectedOption !== undefined;
  const [showSettings, setShowSettings] = useState(false);

  const [saveBoxDialogOpen, setSaveBoxDialogOpen] = useState(false);

  const {
    selectedTabId,
    tabs,
    renderTabContent,
    reorderTabs,
    closeTab,
    selectTab,
  } = useTabManager();

  const isExecutionPageVisible = useMemo(() => {
    return selectedTabId === 'box';
  }, [selectedTabId]);

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

  const handleCopyLinkClick = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
    toast.success('Link copied to clipboard');
  };

  const handleSaveClick = () => {
    setSaveBoxDialogOpen(true);
  };

  const handleDeleteClick = async () => {
    const boxLabel = selectedOption?.label ?? '';
    await deleteBox();
    toast.success(`Deleted "${boxLabel}"`);
    router.push('/playground');
  };

  return (
    <>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <div className="flex flex-col w-dvw h-dvh">
        <AppNavBar
          drawerContents={
            <BoxPageNavbar
              hasBox={hasBox}
              isBoxCustom={isBoxCustom}
              handleCopyLinkClick={handleCopyLinkClick}
              handleSaveClick={handleSaveClick}
              handleDeleteClick={handleDeleteClick}
              tabItems={tabItems}
              reorderTabs={reorderTabs}
              selectTab={selectTab}
              closeTab={closeTab}
              setShowSettings={setShowSettings}
            />
          }
        >
          <BoxPageHeader
            handleSaveClick={handleSaveClick}
            handleDeleteClick={handleDeleteClick}
            groupedBoxOptions={groupedBoxOptions}
            selectedOption={selectedOption}
            isExecutionPageVisible={isExecutionPageVisible}
            hasBox={hasBox}
          />
        </AppNavBar>
        <div className="flex flex-1">
          <BoxPageSidebar
            tabItems={tabItems}
            reorderTabs={reorderTabs}
            selectTab={selectTab}
            closeTab={closeTab}
            setShowSettings={setShowSettings}
          />
          {tabs.map((tab) => (
            <TabProvider key={tab.id} tab={tab}>
              <main
                className={clsx(
                  'flex-1 overflow-auto',
                  tab.id !== selectedTabId && 'hidden',
                )}
              >
                {renderTabContent(tab.id)}
              </main>
            </TabProvider>
          ))}
        </div>
        {/* Controls for larger screens */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="hidden lg:flex items-center gap-4 rounded-full px-4 py-2 bg-surface border shadow">
            <BoxExecutionControls />
          </div>
        </div>
        {/* Controls for small screens */}
        {isExecutionPageVisible && (
          <div className="flex px-2 gap-4 justify-center border-t items-center py-2 lg:hidden">
            <BoxExecutionControls />
          </div>
        )}
      </div>
      <SaveBoxDialog
        selectedOption={selectedOption}
        saveBoxDialogOpen={saveBoxDialogOpen}
        setSaveBoxDialogOpen={setSaveBoxDialogOpen}
        handleSaveClick={handleSaveClick}
      />
    </>
  );
}

export default function BoxPage() {
  return (
    <BoxPageExecutionWrapper>
      <BoxPageImpl />
    </BoxPageExecutionWrapper>
  );
}
