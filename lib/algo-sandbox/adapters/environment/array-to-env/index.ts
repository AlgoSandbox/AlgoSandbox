import { createAdapter, createState } from '@algo-sandbox/core';
import { sandboxEnvironmentState } from '@algo-sandbox/states';
import { z } from 'zod';

type ArrayAction = {
  type: 'swap';
  from: number;
  to: number;
};

function parseAction(action: string): ArrayAction {
  return JSON.parse(action) as ArrayAction;
}

function stringifyAction(action: ArrayAction): string {
  return JSON.stringify(action);
}

const inputState = createState(
  'Array to env input state',
  z.object({
    array: z.array(z.any()),
  }),
);

type ArrayState = z.infer<typeof inputState.shape>;

const arrayToEnv = createAdapter({
  accepts: inputState,
  outputs: sandboxEnvironmentState,
  transform: (value) => {
    return {
      getInitialState: () => {
        return {
          ...value,
        };
      },
      getStateKey: (state) => {
        return JSON.stringify((state as ArrayState).array);
      },
      actions: (stateAny) => {
        const state = stateAny as ArrayState;

        // adjacent pair swaps
        const n = state.array.length;

        const actions = Array.from({ length: n - 1 }, (_, i) => {
          return stringifyAction({ type: 'swap', from: i, to: i + 1 });
        });

        return actions;
      },
      step: (stateAny, actionString) => {
        const state = stateAny as ArrayState;
        const action = parseAction(actionString);

        const newArray = [...state.array];
        const temp = newArray[action.from];
        newArray[action.from] = newArray[action.to];
        newArray[action.to] = temp;

        const newState = {
          ...state,
          array: newArray,
        };

        // Terminated if sorted
        const terminated = newArray.every(
          (val, i) => i === 0 || val >= newArray[i - 1],
        );

        // Reward is the negative of the number of inversions
        const reward = (() => {
          const n = newArray.length;
          let inversions = 0;
          for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
              if (newArray[i] > newArray[j]) {
                inversions++;
              }
            }
          }
          return -inversions;
        })();

        return {
          nextState: newState,
          truncated: false,
          terminated,
          reward,
          info: {},
        };
      },
      render: () => 'placeholder',
    };
  },
});

export default arrayToEnv;
