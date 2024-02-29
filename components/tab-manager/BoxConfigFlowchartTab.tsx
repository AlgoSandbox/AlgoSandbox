import BoxConfigFlowchart from '@components/flowchart/BoxConfigFlowchart';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const boxConfigFlowchartTabConfig: SandboxBaseTabConfig<'flowchart'> = {
  type: 'flowchart',
  icon: 'build',
  render: ({ tab: { id } }) => <BoxConfigFlowchart tabId={id} />,
};

type BoxConfigFlowchartTab = TabFromConfig<typeof boxConfigFlowchartTabConfig>;

export default BoxConfigFlowchartTab;
