import {
  createParameterizedAdapter,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import evalServerSide from '@utils/eval/evalServerSide';
import { z } from 'zod';

const codeBlockInput = createState('Code block input', z.undefined());

const codeBlockOutput = createState(
  'Code block output',
  z.object({
    output: z.any(),
  }),
);

const codeBlock = createParameterizedAdapter({
  name: 'Code block',
  parameters: {
    code: SandboxParam.code('Code', ''),
  },
  accepts: () => codeBlockInput,
  outputs: () => codeBlockOutput,
  transform: (_, { code }) => {
    return {
      output: () => {
        return evalServerSide(code);
      },
    };
  },
});

export default codeBlock;
