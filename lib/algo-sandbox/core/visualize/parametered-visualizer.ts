import {
  getDefaultParameters,
  Parametered,
  ParsedParameters,
  SandboxParameters,
  SandboxState,
  SandboxStateName,
} from '..';
import { SandboxVisualizer } from '.';

export type SandboxParameteredVisualizer<
  N extends SandboxStateName,
  P extends SandboxParameters,
> = Parametered<SandboxVisualizer<N>, P>;

export type SandboxVisualizerContext<
  N extends SandboxStateName,
  P extends SandboxParameters,
> = {
  parameters: ParsedParameters<P>;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  state: SandboxState<N>;
};

export function createParameteredVisualizer<
  N extends SandboxStateName,
  P extends SandboxParameters,
>({
  name,
  accepts,
  parameters,
  onUpdate,
}: {
  name: string;
  accepts: N;
  parameters: P;
  onUpdate: (context: SandboxVisualizerContext<N, P>) => void;
}): SandboxParameteredVisualizer<N, P> {
  return {
    name,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => {
      return {
        name,
        accepts,
        visualize: (state) => {
          return {
            onUpdate: (context) => {
              onUpdate({ parameters: parsedParameters, state, ...context });
            },
          };
        },
      };
    },
  };
}
