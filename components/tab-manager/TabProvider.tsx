import { createContext, useContext } from 'react';

import { SandboxTabWithId } from './TabManager';

type TabContextType = {
  tab: SandboxTabWithId;
};

const TabContext = createContext<TabContextType>({
  tab: null!,
});

export function useTab() {
  return useContext(TabContext).tab;
}

export default function TabProvider({
  tab,
  children,
}: {
  tab: SandboxTabWithId;
  children: React.ReactNode;
}) {
  return <TabContext.Provider value={{ tab }}>{children}</TabContext.Provider>;
}
