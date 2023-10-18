import {
  createParameteredProblem,
  SandboxParam,
  SandboxProblem,
} from '@algo-sandbox/core';

export const exampleProblem: SandboxProblem<'counter'> = {
  name: 'Example problem',
  shape: 'counter',
  initialState: {
    _stateName: 'counter',
    counter: 0,
  },
};

export const exampleParameteredProblem = createParameteredProblem({
  name: 'Counter',
  shape: 'counter',
  parameters: {
    initialCounterValue: SandboxParam.integer('Initial counter value', 0),
  },
  getInitialState: (parameters) => {
    return {
      _stateName: 'counter',
      counter: parameters.initialCounterValue,
    };
  },
  getName: ({ initialCounterValue }) => {
    return `Example problem with initial value = ${initialCounterValue}`;
  },
});

namespace Examples {
  export const incrementCounter = exampleParameteredProblem;
}

export default Examples;
