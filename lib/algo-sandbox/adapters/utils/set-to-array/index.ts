import { createAdapter, SandboxStateType } from '@algo-sandbox/core';
import { z } from 'zod';

const inputState = {
  name: 'Set to array input',
  shape: z.object({
    set: z.set(z.any()),
  }),
} satisfies SandboxStateType;

const outputState = {
  name: 'Set to array output',
  shape: z.object({
    array: z.array(z.any()),
  }),
} satisfies SandboxStateType;

const setToArray = createAdapter({
  accepts: inputState,
  outputs: outputState,
  transform: ({ set }) => {
    return {
      array: Array.from(set),
    };
  },
});

export default setToArray;
