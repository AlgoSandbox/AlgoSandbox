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
  T extends SandboxStateType,
  P extends SandboxParameters,
> = Parameterized<SandboxProblem<T>, P>;

export function createParameterizedProblem<
  T extends SandboxStateType,
  P extends SandboxParameters,
>({
  name,
  type,
  parameters,
  getName,
  getInitialState,
}: {
  name: string;
  type: T;
  parameters: P;
  getName: (parameters: ParsedParameters<P>) => string;
  getInitialState: (parameters: ParsedParameters<P>) => SandboxState<T>;
}): SandboxParameterizedProblem<T, P> {
  return {
    name,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => {
      return {
        name: getName(parsedParameters),
        type: type,
        getInitialState: () => getInitialState(parsedParameters),
      };
    },
  };
}
