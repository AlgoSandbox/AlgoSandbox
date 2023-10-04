import { z } from 'zod';
import {
  Parametered,
  Parameters,
  ParsedParameters,
  SandboxExecutionContext,
} from '..';
import { SandboxAlgorithm } from './algorithm';

export type SandboxParameteredAlgorithm<
  T,
  U,
  P extends Parameters
> = Parametered<SandboxAlgorithm<T, U>, P>;

type SandboxContextWithParameters<
  T,
  P extends Parameters
> = SandboxExecutionContext<T> & {
  parameters: ParsedParameters<P>;
};

function getDefaultParameters<P extends Parameters>(
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
  P extends Parameters = Parameters
>({
  name,
  parameters,
  getInitialState,
  getPseudocode,
  runAlgorithm,
}: {
  accepts: StateShape;
  name: string;
  parameters: P;
  getInitialState: (problem: T) => U;
  getPseudocode: (parameters: ParsedParameters<P>) => string;
  runAlgorithm: (
    context: SandboxContextWithParameters<U, P>
  ) => ReturnType<SandboxAlgorithm<T, U>['runAlgorithm']>;
}): SandboxParameteredAlgorithm<T, U, P> {
  return {
    name,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => ({
      name,
      pseudocode: getPseudocode(parsedParameters),
      getInitialState,
      runAlgorithm(context) {
        return runAlgorithm({ ...context, parameters: parsedParameters });
      },
    }),
  };
}
