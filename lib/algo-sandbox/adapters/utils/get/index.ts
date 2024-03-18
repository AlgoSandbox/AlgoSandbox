/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createParameterizedAdapter,
  SandboxParam,
  SandboxStateType,
} from '@algo-sandbox/core';
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
    function get(object: any, path: string): any {
      const paths = path.split('.');
      let result = object;
      for (const p of paths) {
        result = result[p];
      }
      return result;
    }
    // custom get which supports * syntax for arrays/objects
    // e.g. customGet({ a: { b: [1, 2, 3] } }, 'a.b') => [1, 2, 3]
    // e.g. customGet([{b: 2}, {b: 3}], '*.b') => [2, 3]
    function customGet(object: any, path: string): any {
      // try to defer to lodash get if possible
      if (path.includes('*')) {
        const parts = path.split('.');
        const [firstPart, ...rest] = parts;
        if (firstPart === '*') {
          if (Array.isArray(object)) {
            return object.map((o: any) => customGet(o, rest.join('.')));
          } else {
            return Object.values(object).map((o: any) =>
              customGet(o, rest.join('.')),
            );
          }
        }
      }
      return get(object, path);
    }

    return {
      valueAtPath: customGet(input.object, parameters.path),
    };
  },
});

export default getAdapter;
