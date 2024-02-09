import AlgorithmVisualizerFlowchart from '@components/flowchart/AlgorithmVisualizerFlowchart';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxFlowchartTabConfig: SandboxBaseTabConfig<'flowchart'> = {
  type: 'flowchart',
  icon: 'build',
  render: ({ tab: { id } }) => <AlgorithmVisualizerFlowchart tabId={id} />,
};

type SandboxFlowchartTab = TabFromConfig<typeof sandboxFlowchartTabConfig>;

export default SandboxFlowchartTab;
