import {
  createParameterizedVisualizer,
  SandboxParam,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';
import { get } from 'lodash';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { z } from 'zod';

const arrayType = {
  name: 'array',
  shape: z.object({
    array: z.array(z.any()),
  }),
} satisfies SandboxStateType;

const array1d = createParameterizedVisualizer<
  typeof arrayType,
  {
    root: Root;
    element: HTMLElement;
  },
  SandboxParameters<{
    accessor: string;
  }>
>({
  name: 'Array 1D',
  accepts: arrayType,
  parameters: {
    accessor: SandboxParam.string('Item path', ''),
  },
  onUpdate: ({
    state: { array },
    previousVisualizerState,
    element,
    parameters: { accessor },
  }) => {
    // Store root in visualizer state to createRoot only once
    const root = (() => {
      if (
        previousVisualizerState !== null &&
        previousVisualizerState.element === element
      ) {
        return previousVisualizerState.root;
      }

      return createRoot(element);
    })();

    root.render(
      createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'start',
            rowGap: 32,
            padding: 8,
          },
        },
        ...array.map((element, index) => {
          const value = get(element, accessor);
          const valueString =
            typeof value === 'object' ? JSON.stringify(value) : String(value);

          return createElement(
            'div',
            {
              key: index,
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                alignItems: 'center',
              },
            },
            createElement(
              'div',
              {
                className: 'text-label',
                style: {
                  fontFamily: 'monospace',
                },
              },
              index,
            ),
            createElement(
              'div',
              {
                className: 'border',
                style: {
                  width: 40,
                  height: 40,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBlockStart: index > 0 ? -1 : 0,
                },
              },
              valueString,
            ),
          );
        }),
      ),
    );

    return { root, element };
  },
});

export default array1d;
