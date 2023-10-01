import { z } from 'zod';
import {
  SandboxProblem,
  SandboxAlgorithm,
  createParameteredAlgorithm,
  SandboxParam,
  createParameteredProblem,
} from '../core';

type ExampleState = {
  counter: number;
};

export const exampleProblem: SandboxProblem<ExampleState> = {
  name: 'Example problem',
  initialState: {
    counter: 0,
  },
};

export const exampleParameteredProblem = createParameteredProblem({
  parameters: {
    initialCounterValue: SandboxParam.integer('Initial counter value', 0),
  },
  getInitialState: (parameters) => {
    return {
      counter: parameters.initialCounterValue,
    };
  },
  getName: ({ initialCounterValue }) => {
    return `Example problem with initial value = ${initialCounterValue}`;
  },
});

export const exampleAlgorithm: SandboxAlgorithm<ExampleState, ExampleState> = {
  pseudocode: 'set counter to 0\nwhile counter < 10:\n  increment counter\nend',
  getInitialState: (problem) => problem,
  *runAlgorithm({ line, state }) {
    yield line(1);
    while (true) {
      yield line(2);
      if (state.counter >= 10) {
        break;
      }
      state.counter += 1;
      yield line(3);
    }
    yield line(4);
    return true;
  },
};

export const exampleParameteredAlgorithm = createParameteredAlgorithm({
  accepts: z.object({
    counter: z.number(),
  }),
  parameters: {
    increment: SandboxParam.integer('Increment value', 1),
    counterLimit: SandboxParam.integer('Counter limit', 10),
  },
  getInitialState: (problem) => problem,
  getPseudocode: ({ increment, counterLimit }) => {
    return `while counter < ${counterLimit}:\n  increment counter by ${increment}\nend`;
  },
  *runAlgorithm({ line, state, parameters: { increment, counterLimit } }) {
    while (true) {
      yield line(1);
      if (state.counter >= counterLimit) {
        break;
      }
      state.counter += increment;
      yield line(2);
    }
    yield line(3);
    return true;
  },
});
