import AlgorithmVisualizerFlowchart from '@components/flowchart/AlgorithmVisualizerFlowchart';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxFlowchartTabConfig: SandboxBaseTabConfig<'flowchart'> = {
  type: 'flowchart',
  icon: 'schema',
  render: () => <AlgorithmVisualizerFlowchart />,
};

type SandboxFlowchartTab = TabFromConfig<typeof sandboxFlowchartTabConfig>;

export default SandboxFlowchartTab;
