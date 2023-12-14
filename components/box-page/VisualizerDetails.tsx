import {
  SandboxParameterizedVisualizer,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';

import ParameterControls from './ParameterControls';

export type VisualizerDetailsProps<
  N extends SandboxStateType,
  P extends SandboxParameters,
> = {
  visualizer: SandboxParameterizedVisualizer<N, P>;
};

export default function VisualizerDetails<
  N extends SandboxStateType,
  P extends SandboxParameters,
>({ visualizer }: VisualizerDetailsProps<N, P>) {
  return (
    <div className="p-4 bg-surface">
      <div className="font-medium flex flex-col gap-2">
        <span>Visualizer parameters</span>
        <ParameterControls parameters={visualizer.parameters} />
      </div>
    </div>
  );
}
