import { createState } from '@algo-sandbox/core';
import { z } from 'zod';

// "unseen": 0,
// "empty": 1,
// "wall": 2,
// "floor": 3,
// "door": 4,
// "key": 5,
// "ball": 6,
// "box": 7,
// "goal": 8,
// "lava": 9,
// "agent": 10,

export const gridWorldState = createState(
  'Grid problem',
  z.object({
    width: z.number(),
    height: z.number(),
    objects: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        type: z.enum([
          'unseen',
          'empty',
          'wall',
          'floor',
          'door',
          'key',
          'ball',
          'box',
          'goal',
          'lava',
          'agent',
        ]),
      }),
    ),
  }),
);
