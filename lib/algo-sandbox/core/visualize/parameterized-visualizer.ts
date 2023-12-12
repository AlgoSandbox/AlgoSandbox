import {
  getDefaultParameters,
  Parameterized,
  ParsedParameters,
  SandboxParameters,
  SandboxState,
  SandboxStateType,
} from '..';
import { SandboxVisualizer } from '.';

export type SandboxParameterizedVisualizer<
  N extends SandboxStateType,
  P extends SandboxParameters,
> = Parameterized<SandboxVisualizer<N>, P>;

export type SandboxVisualizerContext<
  N extends SandboxStateType,
  P extends SandboxParameters,
> = {
  parameters: ParsedParameters<P>;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  state: SandboxState<N>;
};

export function createParameterizedVisualizer<
  N extends SandboxStateType,
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
}): SandboxParameterizedVisualizer<N, P> {
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
