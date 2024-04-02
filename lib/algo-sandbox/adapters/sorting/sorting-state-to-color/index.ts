import { createAdapter, SandboxStateType } from '@algo-sandbox/core';
import { sortingState } from '@algo-sandbox/states';
import { z } from 'zod';

const inputState = {
  name: 'Sorting state to color input',
  shape: z.object({
    sortingStates: z.array(sortingState),
  }),
} satisfies SandboxStateType;

const outputState = {
  name: 'Sorting state to color output',
  shape: z.object({
    backgroundColors: z.array(z.string()),
  }),
} satisfies SandboxStateType;

const sortingStateToColorAdapter = createAdapter({
  accepts: inputState,
  outputs: outputState,
  transform: ({ sortingStates }) => {
    const style = getComputedStyle(document.body);
    const backgroundColors = sortingStates.map((state) => {
      switch (state) {
        case 'unsorted':
          return `rgb(${style.getPropertyValue('--color-label')})`;
        case 'sorted':
          return `rgb(${style.getPropertyValue('--color-success')})`;
        case 'current':
          return `rgb(${style.getPropertyValue('--color-accent')})`;
        case 'comparing':
          return `rgb(${style.getPropertyValue('--color-primary')})`;
      }
    });

    return {
      backgroundColors,
    };
  },
});

export default sortingStateToColorAdapter;
