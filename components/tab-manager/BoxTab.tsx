import { BoxContextProvider } from '@components/box-page';
import { DbBoxSaved } from '@utils/db';

import BoxPage from '../../app/BoxPage';
import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';
export type BoxTabConfigEntry = {
  box: never;
};

export const boxTabConfig: SandboxBaseTabConfig<
  'box',
  {
    box: DbBoxSaved | null;
  }
> = {
  type: 'box',
  icon: 'inventory_2',
  render: ({ data: { box } }) => (
    <BoxContextProvider box={box ?? undefined}>
      <BoxPage />
    </BoxContextProvider>
  ),
};

type BoxTab = TabFromConfig<typeof boxTabConfig>;

export default BoxTab;
