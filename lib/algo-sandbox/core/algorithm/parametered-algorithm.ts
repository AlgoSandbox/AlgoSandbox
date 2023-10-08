import { z } from 'zod';
import {
  Parametered,
  SandboxParameters,
  ParsedParameters,
  SandboxExecutionContext,
  getDefaultParameters,
  SandboxStateName,
  SandboxState,
} from '..';
import { SandboxAlgorithm } from './algorithm';

export type SandboxParameteredAlgorithm<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters
> = Parametered<SandboxAlgorithm<N, M>, P>;

type SandboxContextWithParameters<
  N extends SandboxStateName,
  P extends SandboxParameters
> = SandboxExecutionContext<N> & {
  parameters: ParsedParameters<P>;
};

export function createParameteredAlgorithm<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters = SandboxParameters
>({
  name,
  accepts,
  outputs,
  parameters,
  createInitialState,
  getPseudocode,
  runAlgorithm,
}: {
  name: string;
  accepts: N;
  outputs: M;
  parameters: P;
  createInitialState: (problem: Readonly<SandboxState<N>>) => SandboxState<M>;
  getPseudocode: (parameters: ParsedParameters<P>) => string;
  runAlgorithm: (
    context: SandboxContextWithParameters<M, P>
  ) => ReturnType<SandboxAlgorithm<N, M>['runAlgorithm']>;
}): SandboxParameteredAlgorithm<N, M, P> {
  return {
    name,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => ({
      name,
      accepts,
      outputs,
      pseudocode: getPseudocode(parsedParameters),
      createInitialState,
      runAlgorithm(context) {
        return runAlgorithm({ ...context, parameters: parsedParameters });
      },
    }),
  };
}
