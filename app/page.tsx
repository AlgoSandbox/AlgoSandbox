'use client';

import AppLogoWithName from '@components/AppLogoWithName';

import NewTabPage from './DashboardPage';

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b bg-canvas p-4">
        <AppLogoWithName />
      </div>
      <NewTabPage />
    </div>
  );
}
