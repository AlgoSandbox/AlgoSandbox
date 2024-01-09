import BoxPage from '../../app/BoxPage';
import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export type BoxTabConfigEntry = {
  box: never;
};

export const boxTabConfig: SandboxBaseTabConfig<'box'> = {
  type: 'box',
  icon: 'inventory_2',
  render: () => <BoxPage />,
};

type BoxTab = TabFromConfig<typeof boxTabConfig>;

export default BoxTab;
