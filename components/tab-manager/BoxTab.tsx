import BoxPage from '@app/BoxPage';
import { BoxContextProvider } from '@components/box-page';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';
export type BoxTabConfigEntry = {
  box: never;
};

export const boxTabConfig: SandboxBaseTabConfig<
  'box',
  {
    boxKey: string;
  }
> = {
  type: 'box',
  icon: 'inventory_2',
  render: ({ data: { boxKey } }) => (
    <BoxContextProvider boxKey={boxKey}>
      <BoxPage />
    </BoxContextProvider>
  ),
};

type BoxTab = TabFromConfig<typeof boxTabConfig>;

export default BoxTab;
