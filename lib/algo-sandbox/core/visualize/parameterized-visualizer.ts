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
  V,
  P extends SandboxParameters,
> = Parameterized<SandboxVisualizer<N, V>, P>;

export type SandboxVisualizerContext<
  N extends SandboxStateType,
  V,
  P extends SandboxParameters,
> = {
  parameters: ParsedParameters<P>;
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  state: SandboxState<N>;
  previousVisualizerState: V | null;
};

export function createParameterizedVisualizer<
  N extends SandboxStateType,
  V,
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
  onUpdate: (context: SandboxVisualizerContext<N, V, P>) => V;
}): SandboxParameterizedVisualizer<N, V, P> {
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
              return onUpdate({
                parameters: parsedParameters,
                state,
                ...context,
              });
            },
          };
        },
      };
    },
  };
}
