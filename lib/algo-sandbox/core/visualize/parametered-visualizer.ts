import { Visualizer } from '.';
import { Parametered, Parameters, ParsedParameters } from '..';

export type SandboxParameteredVisualizer<T, P extends Parameters> = Parametered<
  Visualizer<T>,
  P
>;

export type VisualizerContext<T, P extends Parameters> = {
  parameters: ParsedParameters<P>;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  state: T;
};

export function createParameteredVisualizer<T, P extends Parameters>({
  name,
  parameters,
  onUpdate,
}: {
  name: string;
  parameters: P;
  onUpdate: (context: VisualizerContext<T, P>) => void;
}): SandboxParameteredVisualizer<T, P> {
  return {
    name,
    parameters,
    create: (parameters) => {
      return {
        visualize: (state) => {
          return {
            onUpdate: (context) => {
              onUpdate({ parameters, state, ...context });
            },
          };
        },
      };
    },
  };
}
