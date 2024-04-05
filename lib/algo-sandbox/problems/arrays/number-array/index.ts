import {
  createParameterizedProblem,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import { z } from 'zod';

const numberArray = createParameterizedProblem({
  name: 'Number array',
  type: createState('Array', z.object({ array: z.array(z.number()) })),
  parameters: {
    array: SandboxParam.arrayNumber('Min value', []),
  },
  getInitialState: ({ array }) => {
    return {
      array,
    };
  },
  getName: () => {
    return 'Number array';
  },
});

export default numberArray;
