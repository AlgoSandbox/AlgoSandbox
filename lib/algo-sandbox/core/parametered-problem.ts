import { ParsedParameters, SandboxParameters, SandboxProblem } from '.';

export type SandboxParameteredProblem<T, P extends SandboxParameters> = {
  parameters: P;
  createProblem: (parameters: ParsedParameters<P>) => SandboxProblem<T>;
};

export function createParameteredProblem<T, P extends SandboxParameters>({
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
    createProblem: (parameters) => ({
      name: getName(parameters),
      initialState: getInitialState(parameters),
    }),
  };
}
