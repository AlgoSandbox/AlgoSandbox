import { SandboxStateType, SandboxVisualizer } from '@algo-sandbox/core';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { chromeDark, ObjectInspector } from 'react-inspector';
import { z } from 'zod';

const customChromeDark = {
  ...chromeDark,
  BASE_BACKGROUND_COLOR: 'transparent',
};

const objectType = {
  name: 'object',
  shape: z.object({
    object: z.any(),
  }),
} satisfies SandboxStateType;

const objectInspectorComponent: SandboxVisualizer<
  typeof objectType,
  {
    root: Root;
    element: HTMLElement;
  }
> = {
  name: 'Object inspector',
  accepts: objectType,
  visualize: (state) => {
    return {
      onUpdate: ({ element, previousVisualizerState }) => {
        const resolvedTheme = element.matches('.dark *') ? 'dark' : 'light';

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
            createElement(ObjectInspector, {
              theme: (resolvedTheme === 'dark'
                ? customChromeDark
                : 'chromeLight') as string,
              data: state.object,
              expandLevel: 5,
            }),
          ),
        );

        return { root, element };
      },
    };
  },
};

export default objectInspectorComponent;
