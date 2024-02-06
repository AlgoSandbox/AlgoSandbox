import {
  SandboxParameterizedVisualizer,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';

import ParameterControls from './ParameterControls';

export type VisualizerDetailsProps<
  N extends SandboxStateType,
  V,
  P extends SandboxParameters,
> = {
  visualizer: SandboxParameterizedVisualizer<N, V, P>;
};

export default function VisualizerDetails<
  N extends SandboxStateType,
  V,
  P extends SandboxParameters,
>({ visualizer }: VisualizerDetailsProps<N, V, P>) {
  return (
    <div className="p-4 bg-surface">
      <div className="font-medium flex flex-col gap-2">
        <span>Visualizer parameters</span>
        <ParameterControls parameters={visualizer.parameters} />
      </div>
    </div>
  );
}
