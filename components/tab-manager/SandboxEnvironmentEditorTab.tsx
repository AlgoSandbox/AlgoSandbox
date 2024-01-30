import { BoxContextProvider } from '@components/box-page';

import BoxEnvironmentEditorPage from '../../app/BoxEnvironmentEditorPage';
import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxEnvironmentEditorTabConfig: SandboxBaseTabConfig<
  'box-editor',
  {
    boxKey: string;
  }
> = {
  type: 'box-editor',
  icon: 'inventory_2',
  subIcon: 'edit',
  render: ({ data: { boxKey } }) => (
    <BoxContextProvider boxKey={boxKey}>
      <BoxEnvironmentEditorPage />
    </BoxContextProvider>
  ),
};

type SandboxEnvironmentEditorTab = TabFromConfig<
  typeof sandboxEnvironmentEditorTabConfig
>;

export default SandboxEnvironmentEditorTab;
