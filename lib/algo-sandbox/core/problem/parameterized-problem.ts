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
  type: N;
};

export function createParameterizedProblem<
  N extends SandboxStateType,
  P extends SandboxParameters,
>({
  name,
  type,
  parameters,
  getName,
  getInitialState,
}: {
  name: string;
  type: N;
  parameters: P;
  getName: (parameters: ParsedParameters<P>) => string;
  getInitialState: (parameters: ParsedParameters<P>) => SandboxState<N>;
}): SandboxParameterizedProblem<N, P> {
  return {
    name,
    type,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => {
      return {
        name: getName(parsedParameters),
        type: type,
        initialState: getInitialState(parsedParameters),
      };
    },
  };
}
