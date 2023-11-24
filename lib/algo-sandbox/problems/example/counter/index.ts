import { SandboxProblem } from '@algo-sandbox/core';
import { counterState } from '@algo-sandbox/states';

const counterProblem: SandboxProblem<typeof counterState> = {
  name: 'Example problem',
  type: counterState,
  initialState: {
    counter: 0,
  },
};

export default counterProblem;
