import { SandboxProblem } from '@algo-sandbox/core';
import { counterState } from '@algo-sandbox/states';

const counterProblem: SandboxProblem<typeof counterState> = {
  name: 'Example problem',
  shape: counterState,
  initialState: {
    counter: 0,
  },
};

export default counterProblem;
