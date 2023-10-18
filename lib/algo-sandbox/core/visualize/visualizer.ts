import { SandboxState, SandboxStateName } from '..';
import { SandboxVisualization } from '.';

export type SandboxVisualizer<N extends SandboxStateName> = {
  accepts: N;
  visualize: (state: SandboxState<N>) => SandboxVisualization;
};
