import {
  createParameterizedAdapter,
  SandboxParam,
  SandboxStateType,
} from '@algo-sandbox/core';
import { get } from 'lodash';
import { z } from 'zod';

const inputState = {
  name: 'Any object',
  shape: z.object({
    object: z.any(),
  }),
} satisfies SandboxStateType;

const outputState = {
  name: 'Any object',
  shape: z.object({
    valueAtPath: z.any(),
  }),
} satisfies SandboxStateType;

const getAdapter = createParameterizedAdapter({
  name: 'Get',
  parameters: {
    path: SandboxParam.string('Path', ''),
  },
  accepts: () => inputState,
  outputs: () => outputState,
  transform: (input, parameters) => {
    return {
      valueAtPath: get(input.object, parameters.path),
    };
  },
});

export default getAdapter;
