'use client';

import AppLogoWithName from '@components/AppLogoWithName';
import SettingsDialog from '@components/common/SettingsDialog';
import { Button, MaterialSymbol } from '@components/ui';
import { useState } from 'react';

import DashboardPage from './DashboardPage';

export default function Page() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col h-dvh">
      <div className="border-b sticky top-0 bg-canvas ps-4 flex items-center justify-between">
        <AppLogoWithName />
        <Button
          hideLabel={true}
          size="lg"
          label="Settings"
          icon={<MaterialSymbol icon="settings" />}
          onClick={() => {
            setShowSettings(true);
          }}
        />
        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </div>
      <div className="overflow-y-auto">
        <DashboardPage />
      </div>
    </div>
  );
}
