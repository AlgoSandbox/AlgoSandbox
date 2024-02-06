import { SandboxState, SandboxStateType } from '..';
import { SandboxVisualization } from '.';

export type SandboxVisualizer<N extends SandboxStateType, V> = {
  name: string;
  accepts: N;
  visualize: (state: SandboxState<N>) => SandboxVisualization<V>;
};
