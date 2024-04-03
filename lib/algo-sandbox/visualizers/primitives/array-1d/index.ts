import { createVisualizer, SandboxStateType } from '@algo-sandbox/core';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { z } from 'zod';

const arrayType = {
  name: 'array',
  shape: z.object({
    array: z.array(z.any()),
  }),
} satisfies SandboxStateType;

const array1d = createVisualizer<
  typeof arrayType,
  {
    root: Root;
    element: HTMLElement;
  }
>({
  name: 'Array 1D',
  accepts: arrayType,
  onUpdate: ({ state: { array }, previousVisualizerState, element }) => {
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
        ...array.map((value, index) => {
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
                  marginInlineStart: index > 0 ? -1 : 0,
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
