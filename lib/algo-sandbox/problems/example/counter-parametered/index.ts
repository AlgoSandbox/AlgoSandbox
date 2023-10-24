import { createParameteredProblem, SandboxParam } from '@algo-sandbox/core';

const counterParametered = createParameteredProblem({
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
    return `Example counter problem with initial value = ${initialCounterValue}`;
  },
});

export default counterParametered;