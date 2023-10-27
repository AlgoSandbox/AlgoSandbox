import {
  getDefaultParameters,
  Parametered,
  ParsedParameters,
  SandboxParameters,
  SandboxProblem,
  SandboxState,
  SandboxStateName,
} from '..';

export type SandboxParameteredProblem<
  N extends SandboxStateName,
  P extends SandboxParameters,
> = Parametered<SandboxProblem<N>, P> & {
  shape: N;
};

export function createParameteredProblem<
  N extends SandboxStateName,
  P extends SandboxParameters,
>({
  name,
  shape,
  parameters,
  getName,
  getInitialState,
}: {
  name: string;
  shape: N;
  parameters: P;
  getName: (parameters: ParsedParameters<P>) => string;
  getInitialState: (parameters: ParsedParameters<P>) => SandboxState<N>;
}): SandboxParameteredProblem<N, P> {
  return {
    name,
    shape,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => {
      return {
        name: getName(parsedParameters),
        shape,
        initialState: getInitialState(parsedParameters),
      };
    },
  };
}
