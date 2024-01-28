import { BoxContextProvider } from '@components/box-page';
import { DbBoxSaved } from '@utils/db';

import BoxEnvironmentEditorPage from '../../app/BoxEnvironmentEditorPage';
import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxEnvironmentEditorTabConfig: SandboxBaseTabConfig<
  'box-editor',
  {
    box: DbBoxSaved;
  }
> = {
  type: 'box-editor',
  icon: 'inventory_2',
  subIcon: 'edit',
  render: ({ data: { box } }) => (
    <BoxContextProvider box={box}>
      <BoxEnvironmentEditorPage />
    </BoxContextProvider>
  ),
};

type SandboxEnvironmentEditorTab = TabFromConfig<
  typeof sandboxEnvironmentEditorTabConfig
>;

export default SandboxEnvironmentEditorTab;
