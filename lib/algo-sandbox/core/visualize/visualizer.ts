import { SandboxVisualization } from '.';
import { SandboxState, SandboxStateName } from '..';

export type SandboxVisualizer<N extends SandboxStateName> = {
  accepts: N;
  visualize: (state: SandboxState<N>) => SandboxVisualization;
};
