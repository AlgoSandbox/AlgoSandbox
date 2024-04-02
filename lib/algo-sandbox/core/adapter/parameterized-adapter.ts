import {
  getDefaultParameters,
  Parameterized,
  ParsedParameters,
  SandboxAdapter,
  SandboxNullableStateType,
  SandboxParameters,
  SandboxState,
  SandboxStateType,
} from '@algo-sandbox/core';

export type SandboxParameterizedAdapter<
  Input extends SandboxNullableStateType,
  Output extends SandboxStateType,
  P extends SandboxParameters,
> = Parameterized<SandboxAdapter<Input, Output>, P>;

export function createParameterizedAdapter<
  Input extends SandboxNullableStateType,
  Output extends SandboxStateType,
  P extends SandboxParameters,
>({
  name,
  parameters,
  accepts,
  outputs,
  transform,
}: {
  name: string;
  parameters: P;
  accepts: (parameters: ParsedParameters<P>) => Input;
  outputs: (parameters: ParsedParameters<P>) => Output;
  transform: (
    input: SandboxState<Input>,
    parameters: ParsedParameters<P>,
  ) => SandboxState<Output>;
}): SandboxParameterizedAdapter<Input, Output, P> {
  return {
    name,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => ({
      accepts: accepts(parsedParameters),
      outputs: outputs(parsedParameters),
      transform: (input) => transform(input, parsedParameters),
    }),
  };
}
