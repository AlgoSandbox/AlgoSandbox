import {
  createEnvironment,
  getDefaultParameters,
  ParsedParameters,
  SandboxEnvironmentState,
  SandboxParameterizedProblem,
  SandboxParameters,
  SandboxState,
  SandboxStateType,
} from '@algo-sandbox/core';
import { UnknownKeysParam, z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

export type SandboxParameterizedEnvironment<
  T extends SandboxStateType,
  Action extends string,
  P extends SandboxParameters,
> = SandboxParameterizedProblem<
  {
    name: string;
    shape: ZodObject<
      ZodRawShape,
      UnknownKeysParam,
      ZodTypeAny,
      SandboxEnvironmentState<z.infer<T['shape']>, Action>
    >;
  },
  P
>;

export function createParameterizedEnvironment<
  const T extends SandboxStateType,
  const Actions extends [string, ...Array<string>],
  const P extends SandboxParameters,
>({
  name,
  initialStateType,
  actionsType,
  parameters,
  getStateKey,
  getInitialState,
  step,
  actions,
  render,
}: {
  name: string;
  initialStateType: T;
  actionsType: z.ZodEnum<Actions> | z.ZodString;
  parameters: P;
  getStateKey: (
    state: SandboxState<T>,
    parameters: ParsedParameters<P>,
  ) => string;
  getInitialState: (parameters: ParsedParameters<P>) => SandboxState<T>;
  step: (
    state: SandboxState<T>,
    action: Actions[number],
    parameters: ParsedParameters<P>,
  ) => {
    nextState: SandboxState<T>;
    reward: number;
    terminated: boolean;
    truncated: boolean;
    info: Record<string, unknown>;
  };
  actions: (
    state: SandboxState<T>,
    parameters: ParsedParameters<P>,
  ) => Array<Actions[number]>;
  render: (
    state: SandboxState<T>,
    parameters: ParsedParameters<P>,
  ) => React.ReactNode;
}): SandboxParameterizedEnvironment<T, Actions[number], P> {
  return {
    name,
    parameters,
    create: (parsedParameters = getDefaultParameters(parameters)) => {
      return createEnvironment({
        name,
        initialStateType,
        actionsType,
        getStateKey: (state) => getStateKey(state, parsedParameters),
        getInitialState: () => getInitialState(parsedParameters),
        step: (state, action) => step(state, action, parsedParameters),
        actions: (state) => actions(state, parsedParameters),
        render: (state) => render(state, parsedParameters),
      });
    },
  };
}
