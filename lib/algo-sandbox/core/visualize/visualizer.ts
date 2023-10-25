import { SandboxState, SandboxStateName } from '..';
import { SandboxVisualization } from '.';

export type SandboxVisualizer<N extends SandboxStateName> = {
  name: string;
  accepts: N;
  visualize: (state: SandboxState<N>) => SandboxVisualization;
};
