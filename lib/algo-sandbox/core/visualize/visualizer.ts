import { SandboxState, SandboxStateType } from '..';
import { SandboxVisualization, SandboxVisualizationContext } from '.';

export type SandboxVisualizer<N extends SandboxStateType, V> = {
  name: string;
  accepts: N;
  visualize: (state: SandboxState<N>) => SandboxVisualization<V>;
};

export function createVisualizer<N extends SandboxStateType, V>({
  name,
  accepts,
  onUpdate,
}: {
  name: string;
  accepts: N;
  onUpdate: (
    context: SandboxVisualizationContext<V> & { state: SandboxState<N> },
  ) => V;
}): SandboxVisualizer<N, V> {
  return {
    name,
    accepts,
    visualize: (state) => {
      return {
        onUpdate: (context) => {
          return onUpdate({
            state,
            ...context,
          });
        },
      };
    },
  };
}
