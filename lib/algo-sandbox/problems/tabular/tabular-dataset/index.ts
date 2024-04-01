import {
  createParameterizedProblem,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import { z } from 'zod';

export const tabularDatasetState = createState(
  'Tabular dataset',
  z.object({
    xLabels: z.array(z.string()),
    data: z.array(
      z.object({
        xValues: z.record(z.string()),
        yValue: z.string(),
      }),
    ),
  }),
);

const tabularDataset = createParameterizedProblem({
  name: 'Decision tree training set',
  type: tabularDatasetState,
  parameters: {
    spreadsheet: SandboxParam.spreadsheet(
      'Training data',
      '{"xLabels":["Weather","Energy"],"data":[{"xValues":{"Weather":"Hot","Energy":"Low"},"yValue":"Stay"},{"xValues":{"Weather":"Cold","Energy":"High"},"yValue":"Go out"},{"xValues":{"Weather":"Hot","Energy":"High"},"yValue":"Stay"},{"xValues":{"Weather":"Cold","Energy":"Medium"},"yValue":"Go out"},{"xValues":{"Weather":"Cold","Energy":"Low"},"yValue":"Stay"}]}',
    ),
  },
  getInitialState: (parameters) => {
    return tabularDatasetState.shape.parse(JSON.parse(parameters.spreadsheet));
  },
  getName: () => {
    return 'Tabular dataset';
  },
});

export default tabularDataset;
