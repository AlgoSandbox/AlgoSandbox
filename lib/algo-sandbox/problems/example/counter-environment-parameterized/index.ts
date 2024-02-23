import {
  createParameterizedEnvironment,
  SandboxParam,
} from '@algo-sandbox/core';
import { counterState } from '@algo-sandbox/states';
import { z } from 'zod';

const counterEnvironmentParameterized = createParameterizedEnvironment({
  name: 'Counter (environment)',
  initialStateType: counterState,
  actionsType: z.enum(['increment', 'decrement']),
  parameters: {
    initialCounterValue: SandboxParam.integer('Initial counter value', 0),
    increment: SandboxParam.integer('Increment value', 1),
    decrement: SandboxParam.integer('Decrement value', 1),
  },
  getStateKey: (state) => state.counter.toString(),
  getInitialState: ({ initialCounterValue }) => ({
    counter: initialCounterValue,
  }),
  step: (state, action, { increment, decrement }) => {
    switch (action) {
      case 'increment':
        return {
          nextState: { counter: state.counter + increment },
          reward: 1,
          terminated: false,
          truncated: false,
          info: {},
        };
      case 'decrement':
        return {
          nextState: { counter: state.counter - decrement },
          reward: -1,
          terminated: false,
          truncated: false,
          info: {},
        };
    }
  },
  actions: () => ['increment', 'decrement'],
  render: (state) => state.counter,
});

export default counterEnvironmentParameterized;
