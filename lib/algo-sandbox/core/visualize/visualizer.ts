import { SandboxState, SandboxStateType } from '..';
import { SandboxVisualization } from '.';

export type SandboxVisualizer<N extends SandboxStateType> = {
  name: string;
  accepts: N;
  visualize: (state: SandboxState<N>) => SandboxVisualization;
};
