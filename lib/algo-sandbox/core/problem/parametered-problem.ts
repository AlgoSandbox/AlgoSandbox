import { ParsedParameters, Parameters, SandboxProblem } from '..';

export type SandboxParameteredProblem<T, P extends Parameters> = {
  parameters: P;
  create: (parameters: ParsedParameters<P>) => SandboxProblem<T>;
};

export function createParameteredProblem<T, P extends Parameters>({
  parameters,
  getName,
  getInitialState,
}: {
  parameters: P;
  getName: (parameters: ParsedParameters<P>) => string;
  getInitialState: (parameters: ParsedParameters<P>) => T;
}): SandboxParameteredProblem<T, P> {
  return {
    parameters,
    create: (parameters) => ({
      name: getName(parameters),
      initialState: getInitialState(parameters),
    }),
  };
}
