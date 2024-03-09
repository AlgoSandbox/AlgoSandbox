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
    array: z.array(z.array(z.any())),
  }),
} satisfies SandboxStateType;

const array2d = createParameterizedVisualizer<
  typeof arrayType,
  {
    root: Root;
    element: HTMLElement;
  },
  SandboxParameters<{
    accessor: string;
  }>
>({
  name: 'Array 2D',
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

    const maxRowLength = Math.max(...array.map((row) => row.length));

    root.render(
      createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
          },
        },
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignContent: 'start',
              padding: 8,
            },
          },
          ...array.map((row, rowIndex) => {
            return createElement(
              'div',
              {
                key: rowIndex,
                style: {
                  display: 'flex',
                  justifyContent: 'end',
                  alignItems: 'end',
                  // Remove top margin for rows after the first
                  marginBlockStart: rowIndex > 0 ? -1 : 0,
                },
              },
              createElement(
                'div',
                {
                  className: 'text-label',
                  style: {
                    fontFamily: 'monospace',
                    marginInlineEnd: 8,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                  },
                },
                rowIndex,
              ),
              ...Array.from({ length: maxRowLength }, (_, colIndex) => {
                const valueString = (() => {
                  if (colIndex >= row.length) {
                    return '';
                  }

                  const element = row[colIndex];
                  const value =
                    accessor === '' ? element : get(element, accessor);
                  return typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value);
                })();

                const isValueSignificant =
                  valueString !== '' && valueString !== '0';

                return createElement(
                  'div',
                  {
                    key: colIndex,
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    },
                  },
                  rowIndex === 0 &&
                    createElement(
                      'div',
                      {
                        className: 'text-label',
                        style: {
                          fontFamily: 'monospace',
                        },
                      },
                      colIndex,
                    ),
                  createElement(
                    'div',
                    {
                      className: [
                        colIndex < row.length ? 'border' : '',
                        isValueSignificant ? 'text-on-primary' : 'text-border',
                      ].join(' '),
                      style: {
                        width: 40,
                        height: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBlockStart: rowIndex > 0 ? 1 : 0,
                      },
                    },
                    colIndex < row.length && valueString,
                  ),
                );
              }),
            );
          }),
        ),
      ),
    );

    return { root, element };
  },
});

export default array2d;
