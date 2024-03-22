const BoxPage = dynamic(() => import('@app/playground/BoxExecutionPage'), {
  ssr: false,
});

import dynamic from 'next/dynamic';

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
