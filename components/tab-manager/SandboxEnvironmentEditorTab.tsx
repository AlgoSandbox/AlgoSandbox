import BoxEnvironmentEditorPage from '../../app/BoxEnvironmentEditorPage';
import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxEnvironmentEditorTabConfig: SandboxBaseTabConfig<'box-editor'> =
  {
    type: 'box-editor',
    icon: 'inventory_2',
    subIcon: 'edit',
    render: () => <BoxEnvironmentEditorPage />,
  };

type SandboxEnvironmentEditorTab = TabFromConfig<
  typeof sandboxEnvironmentEditorTabConfig
>;

export default SandboxEnvironmentEditorTab;
