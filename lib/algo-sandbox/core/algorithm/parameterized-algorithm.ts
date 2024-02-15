import {
  getDefaultParameters,
  Parameterized,
  ParsedParameters,
  SandboxExecutionContext,
  SandboxParameters,
  SandboxState,
  SandboxStateType,
} from '..';
import { SandboxAlgorithm } from './algorithm';

export type SandboxParameterizedAlgorithm<
  N extends SandboxStateType,
  M extends SandboxStateType,
  P extends SandboxParameters,
> = Parameterized<SandboxAlgorithm<N, M>, P>;

type SandboxContextWithParameters<
  N extends SandboxStateType,
  M extends SandboxStateType,
  P extends SandboxParameters,
> = SandboxExecutionContext<N, M> & {
  parameters: ParsedParameters<P>;
};

export function createParameterizedAlgorithm<
  N extends SandboxStateType,
  M extends SandboxStateType,
  P extends SandboxParameters = SandboxParameters,
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
    context: SandboxContextWithParameters<N, M, P>,
  ) => ReturnType<SandboxAlgorithm<N, M>['runAlgorithm']>;
}): SandboxParameterizedAlgorithm<N, M, P> {
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
