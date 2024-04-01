import {
  createParameterizedProblem,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import random from 'random';
import { z } from 'zod';

const general = createParameterizedProblem({
  name: 'Random array generator',
  type: createState('Array', z.object({ array: z.array(z.number()) })),
  parameters: {
    minValue: SandboxParam.integer('Min value', 0),
    maxValue: SandboxParam.integer('Max value', 100),
    length: SandboxParam.integer(
      'Length',
      10,
      (value) => value > 0 || 'Length must be greater than 0',
    ),
    seed: SandboxParam.string('Seed', ''),
  },
  getInitialState: ({ minValue, maxValue, length, seed }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    random.use(seed as any);

    return {
      array: Array.from({ length }, () => random.int(minValue, maxValue)),
    };
  },
  getName: () => {
    return 'Random array generator';
  },
});

export default general;
