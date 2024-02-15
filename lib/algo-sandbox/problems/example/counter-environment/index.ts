import { createEnvironment } from '@algo-sandbox/core';
import { counterState } from '@algo-sandbox/states';
import { z } from 'zod';

const counterEnvironment = createEnvironment({
  name: 'Counter (environment)',
  initialStateType: counterState,
  actionsType: z.enum(['increment', 'decrement']),
  getStateKey: (state) => state.counter,
  getInitialState: () => ({
    counter: 1,
  }),
  step: (state, action) => {
    switch (action) {
      case 'increment':
        return {
          nextState: { counter: state.counter + 1 },
          reward: 1,
          terminated: false,
          truncated: false,
          info: {},
        };
      case 'decrement':
        return {
          nextState: { counter: state.counter - 1 },
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

export default counterEnvironment;
