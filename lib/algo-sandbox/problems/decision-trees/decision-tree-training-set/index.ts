import {
  createParameterizedProblem,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import { z } from 'zod';

export const decisionTreeTrainingSetState = createState(
  'Decision tree examples',
  z.object({
    attributes: z.array(z.string()),
    examples: z.array(
      z.object({
        attributes: z.record(z.string()),
        classification: z.string(),
      }),
    ),
  }),
);

const decisionTreeTrainingSet = createParameterizedProblem({
  name: 'Decision tree training set',
  type: decisionTreeTrainingSetState,
  parameters: {
    spreadsheet: SandboxParam.spreadsheet(
      'Training data',
      '{"attributes":["Weather","Energy"],"examples":[{"attributes":{"Weather":"Hot","Energy":"Low"},"classification":"Stay"},{"attributes":{"Weather":"Cold","Energy":"High"},"classification":"Go out"},{"attributes":{"Weather":"Hot","Energy":"High"},"classification":"Stay"},{"attributes":{"Weather":"Cold","Energy":"Medium"},"classification":"Go out"},{"attributes":{"Weather":"Cold","Energy":"Low"},"classification":"Stay"}]}',
    ),
  },
  getInitialState: (parameters) => {
    return decisionTreeTrainingSetState.shape.parse(
      JSON.parse(parameters.spreadsheet),
    );
  },
  getName: () => {
    return 'Decision tree training set';
  },
});

export default decisionTreeTrainingSet;
