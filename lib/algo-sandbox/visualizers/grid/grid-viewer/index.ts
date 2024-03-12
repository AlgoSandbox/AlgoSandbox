import { SandboxStateType, SandboxVisualizer } from '@algo-sandbox/core';
import { GridViewer } from '@algo-sandbox/react-components';
import { gridWorldState } from '@algo-sandbox/states';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { z } from 'zod';

const objectType = {
  name: 'object',
  shape: z.object({
    grid: gridWorldState.shape,
  }),
} satisfies SandboxStateType;

const gridViewerComponent: SandboxVisualizer<
  typeof objectType,
  {
    root: Root;
    element: HTMLElement;
  }
> = {
  name: 'Grid viewer',
  accepts: objectType,
  visualize: (state) => {
    return {
      onUpdate: ({ element, previousVisualizerState }) => {
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
              className:
                'font-mono w-full h-full text-xs px-2 pt-2 overflow-y-auto',
            },
            createElement(GridViewer, {
              width: state.grid.width,
              height: state.grid.height,
              objects: state.grid.objects,
              hideRowIndicators: true,
              hideColumnIndicators: true,
            }),
          ),
        );

        return { root, element };
      },
    };
  },
};

export default gridViewerComponent;
