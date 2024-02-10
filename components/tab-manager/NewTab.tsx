import DashboardPage from '@app/DashboardPage';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const newTabConfig: SandboxBaseTabConfig<'new-tab'> = {
  type: 'new-tab',
  icon: 'add',
  render: () => <DashboardPage />,
};

type NewTab = TabFromConfig<typeof newTabConfig>;

export default NewTab;
