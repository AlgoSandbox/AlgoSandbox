import { BoxContextProvider } from '@components/box-page';
import AlgorithmVisualizerFlowchart from '@components/flowchart/AlgorithmVisualizerFlowchart';

import { SandboxBaseTabConfig, TabFromConfig } from './TabManager';

export const sandboxFlowchartTabConfig: SandboxBaseTabConfig<
  'flowchart',
  {
    boxKey: string;
  }
> = {
  type: 'flowchart',
  icon: 'schema',
  render: ({ tab: { id }, data: { boxKey } }) => (
    <BoxContextProvider boxKey={boxKey}>
      <AlgorithmVisualizerFlowchart tabId={id} />
    </BoxContextProvider>
  ),
};

type SandboxFlowchartTab = TabFromConfig<typeof sandboxFlowchartTabConfig>;

export default SandboxFlowchartTab;
