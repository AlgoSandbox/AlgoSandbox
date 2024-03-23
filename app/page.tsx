'use client';

import AppLogoWithName from '@components/AppLogoWithName';

import DashboardPage from './DashboardPage';

export default function Page() {
  return (
    <div className="flex flex-col h-dvh">
      <div className="border-b bg-canvas p-4">
        <AppLogoWithName />
      </div>
      <DashboardPage />
    </div>
  );
}
