import {
  getDefaultParameters,
  Parameterized,
  ParsedParameters,
  SandboxParameters,
  SandboxProblem,
  SandboxState,
  SandboxStateType,
} from '..';

export type SandboxParameterizedProblem<
  N extends SandboxStateType,
  P extends SandboxParameters,
> = Parameterized<SandboxProblem<N>, P> & {
  shape: N;
};

export function createParameterizedProblem<
  N extends SandboxStateType,
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
}): SandboxParameterizedProblem<N, P> {
  return {
    name,
    shape,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => {
      return {
        name: getName(parsedParameters),
        type: shape,
        initialState: getInitialState(parsedParameters),
      };
    },
  };
}
