import NewTabPage from '@app/NewTabPage';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const newTabConfig: SandboxBaseTabConfig<'new-tab'> = {
  type: 'new-tab',
  render: () => <NewTabPage />,
};

type NewTab = TabFromConfig<typeof newTabConfig>;

export default NewTab;
