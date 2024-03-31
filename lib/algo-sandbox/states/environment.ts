import {
  createState,
  SandboxEnvironment,
  SandboxStateType,
} from '@algo-sandbox/core';
import { z, ZodType } from 'zod';

export const sandboxEnvironmentState = createState(
  'Environment',
  z.object({
    getInitialState: z.function().returns(z.record(z.any())),
    getStateKey: z.function().args(z.record(z.any())).returns(z.string()),
    step: z.function(z.tuple([z.unknown(), z.string()])).returns(
      z.object({
        nextState: z.record(z.any()),
        reward: z.number(),
        terminated: z.boolean(),
        truncated: z.boolean(),
        info: z.record(z.unknown()),
      }),
    ),
    actions: z.function().args(z.record(z.any())).returns(z.array(z.string())),
    render: z.function().args(z.record(z.any())).returns(z.any()),
  }) satisfies ZodType<
    ReturnType<SandboxEnvironment<SandboxStateType, string>['getInitialState']>
  >,
);

const action = sandboxEnvironmentState.shape.shape.actions.returnType().element;

const baseSearchTreeNode = z.object({
  id: z.string(),
  stateKey: z.string(),
  action: action.nullable(),
});

export type SearchTreeNode = z.infer<typeof baseSearchTreeNode> & {
  children: SearchTreeNode[];
};

export const searchTreeNode: z.ZodType<SearchTreeNode> =
  baseSearchTreeNode.extend({
    children: z.lazy(() => searchTreeNode.array()),
  });

export const sandboxEnvironmentSearchState = createState(
  'Sandbox environment search state',
  z.object({
    currentState:
      sandboxEnvironmentState.shape.shape.getInitialState.returnType(),
    initialState:
      sandboxEnvironmentState.shape.shape.getInitialState.returnType(),
    actions: sandboxEnvironmentState.shape.shape.actions.returnType(),
    visited: z.set(
      sandboxEnvironmentState.shape.shape.getStateKey.returnType(),
    ),
    frontier: z.array(
      z.object({
        id: z.string(),
        state: sandboxEnvironmentState.shape.shape.getInitialState.returnType(),
        cost: z.number(),
        isGoal: z.boolean(),
        data: z.any().optional(),
      }),
    ),
    searchTree: searchTreeNode.nullable(),
  }),
);
