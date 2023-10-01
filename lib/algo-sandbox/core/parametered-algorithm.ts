import { z } from 'zod';
import { SandboxContext } from '.';
import { SandboxAlgorithm } from './algorithm';
import { ParsedParameters, SandboxParameters } from './parameters';

export type SandboxParameteredAlgorithm<T, U, P extends SandboxParameters> = {
  parameters: P;
  createAlgorithm: (parameters?: ParsedParameters<P>) => SandboxAlgorithm<T, U>;
};

type SandboxContextWithParameters<
  T,
  P extends SandboxParameters
> = SandboxContext<T> & {
  parameters: ParsedParameters<P>;
};

function getDefaultParameters<P extends SandboxParameters>(
  parameters: P
): ParsedParameters<P> {
  return Object.fromEntries(
    Object.entries(parameters).map(([key, value]) => [key, value.defaultValue])
  ) as ParsedParameters<P>;
}

export function createParameteredAlgorithm<
  StateShape extends z.AnyZodObject,
  U,
  T = z.infer<StateShape>,
  P extends SandboxParameters = SandboxParameters
>({
  parameters,
  getInitialState,
  getPseudocode,
  runAlgorithm,
}: {
  accepts: StateShape;
  parameters: P;
  getInitialState: (problem: T) => U;
  getPseudocode: (parameters: ParsedParameters<P>) => string;
  runAlgorithm: (
    context: SandboxContextWithParameters<U, P>
  ) => ReturnType<SandboxAlgorithm<T, U>['runAlgorithm']>;
}): SandboxParameteredAlgorithm<T, U, P> {
  return {
    parameters,
    createAlgorithm: (parsedParameters = getDefaultParameters(parameters)) => ({
      pseudocode: getPseudocode(parsedParameters),
      getInitialState,
      runAlgorithm(context) {
        return runAlgorithm({ ...context, parameters: parsedParameters });
      },
    }),
  };
}
