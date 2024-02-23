import {
  SandboxProblem,
  SandboxState,
  SandboxStateType,
} from '@algo-sandbox/core';
import { UnknownKeysParam, z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

export type SandboxEnvironmentState<State, Action> = {
  getInitialState: () => State;
  getStateKey: (state: State) => string | symbol | number;
  step: (
    state: State,
    action: Action,
  ) => {
    nextState: State;
    reward: number;
    terminated: boolean;
    truncated: boolean;
    info: Record<string, unknown>;
  };
  actions: (state: State) => Array<Action>;
  render: (state: State) => React.ReactNode;
};

export type SandboxEnvironment<
  T extends SandboxStateType,
  Action extends string,
> = SandboxProblem<{
  name: string;
  shape: ZodObject<
    ZodRawShape,
    UnknownKeysParam,
    ZodTypeAny,
    SandboxEnvironmentState<z.infer<T['shape']>, Action>
  >;
}>;

export function createEnvironment<
  const T extends SandboxStateType,
  const Actions extends [string, ...Array<string>],
>({
  name,
  initialStateType,
  actionsType,
  getInitialState,
  getStateKey,
  step,
  actions,
  render,
}: {
  name: string;
  initialStateType: T;
  actionsType: z.ZodEnum<Actions>;
  getInitialState: () => SandboxState<T>;
  getStateKey: (state: SandboxState<T>) => string;
  step: (
    state: SandboxState<T>,
    action: Actions[number],
  ) => {
    nextState: SandboxState<T>;
    reward: number;
    terminated: boolean;
    truncated: boolean;
    info: Record<string, unknown>;
  };
  actions: (state: SandboxState<T>) => Array<Actions[number]>;
  render: (state: SandboxState<T>) => React.ReactNode;
}): SandboxEnvironment<T, Actions[number]> {
  return {
    name,
    type: {
      name: `${name} environment`,
      shape: z.object({
        getInitialState: z.function().returns(initialStateType.shape),
        getStateKey: z
          .function()
          .args(initialStateType.shape)
          .returns(z.union([z.string(), z.symbol(), z.number()])),
        step: z.function().returns(
          z.object({
            nextState: initialStateType.shape,
            reward: z.number(),
            terminated: z.boolean(),
            truncated: z.boolean(),
            info: z.record(z.unknown()),
          }),
        ),
        actions: z
          .function()
          .args(initialStateType.shape)
          .returns(z.array(actionsType)),
        render: z.function().args(initialStateType.shape).returns(z.any()),
      }),
    },
    getInitialState: () => ({
      getInitialState,
      getStateKey,
      step,
      actions,
      render,
    }),
  };
}

export const sandboxEnvironment = z.object({
  getInitialState: z.function(),
  step: z.function().returns(
    z.object({
      nextState: z.unknown(),
      reward: z.number(),
      terminated: z.boolean(),
      truncated: z.boolean(),
      info: z.record(z.unknown()),
    }),
  ),
  actions: z.function().returns(z.array(z.string())),
  render: z.function().returns(z.any()),
});
