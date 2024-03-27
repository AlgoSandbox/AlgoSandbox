'use client';

import AppLogoWithName from '@components/AppLogoWithName';

import DashboardPage from './DashboardPage';

export default function Page() {
  return (
    <div className="flex flex-col h-dvh">
      <div className="border-b sticky top-0 bg-canvas p-4">
        <AppLogoWithName />
      </div>
      <div className="overflow-y-auto">
        <DashboardPage />
      </div>
    </div>
  );
}
