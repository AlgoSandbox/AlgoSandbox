import { SandboxProblem } from '@algo-sandbox/core';

const counterProblem: SandboxProblem<'counter'> = {
  name: 'Example problem',
  shape: 'counter',
  initialState: {
    _stateName: 'counter',
    counter: 0,
  },
};

export default counterProblem;
