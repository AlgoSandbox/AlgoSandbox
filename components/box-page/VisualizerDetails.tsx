import {
  SandboxParameteredVisualizer,
  SandboxParameters,
  SandboxStateName,
} from '@algo-sandbox/core';

import ParameterControls from './ParameterControls';

export type VisualizerDetailsProps<
  N extends SandboxStateName,
  P extends SandboxParameters
> = {
  visualizer: SandboxParameteredVisualizer<N, P>;
};

export default function VisualizerDetails<
  N extends SandboxStateName,
  P extends SandboxParameters
>({ visualizer }: VisualizerDetailsProps<N, P>) {
  return (
    <div className="p-4 bg-white">
      <div className="font-medium flex flex-col gap-2">
        <span>Visualizer parameters</span>
        <ParameterControls parameters={visualizer.parameters} />
      </div>
    </div>
  );
}
