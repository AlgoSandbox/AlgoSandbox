import { createParameterizedProblem, SandboxParam } from '@algo-sandbox/core';
import { counterState } from '@algo-sandbox/states';

const counterParameterized = createParameterizedProblem({
  name: 'Counter',
  shape: counterState,
  parameters: {
    initialCounterValue: SandboxParam.integer('Initial counter value', 0),
  },
  getInitialState: (parameters) => {
    return {
      counter: parameters.initialCounterValue,
    };
  },
  getName: ({ initialCounterValue }) => {
    return `Example counter problem with initial value = ${initialCounterValue}`;
  },
});

export default counterParameterized;
