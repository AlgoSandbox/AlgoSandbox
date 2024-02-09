import NewTabPage from '@app/NewTabPage';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const newTabConfig: SandboxBaseTabConfig<'new-tab'> = {
  type: 'new-tab',
  icon: 'add',
  render: () => <NewTabPage />,
};

type NewTab = TabFromConfig<typeof newTabConfig>;

export default NewTab;
