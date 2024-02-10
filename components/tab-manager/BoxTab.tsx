import BoxPage from '@app/playground/BoxExecutionPage';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';
export type BoxTabConfigEntry = {
  box: never;
};

export const boxTabConfig: SandboxBaseTabConfig<'box'> = {
  type: 'box',
  icon: 'view_quilt',
  render: () => <BoxPage />,
};

type BoxTab = TabFromConfig<typeof boxTabConfig>;

export default BoxTab;
