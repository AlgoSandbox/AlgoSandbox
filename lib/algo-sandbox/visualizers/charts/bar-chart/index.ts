import { createVisualizer, SandboxStateType } from '@algo-sandbox/core';
import Chart from 'chart.js/auto';
import { z } from 'zod';

const arrayType = {
  name: 'array',
  shape: z.object({
    array: z.array(z.number()),
    backgroundColors: z.array(z.string()).optional(),
  }),
} satisfies SandboxStateType;

const barChart = createVisualizer<
  typeof arrayType,
  {
    canvas: HTMLCanvasElement;
    element: HTMLElement;
    chart: Chart<'bar'>;
  }
>({
  name: 'Bar chart',
  accepts: arrayType,
  onUpdate: ({
    state: { array, backgroundColors },
    previousVisualizerState,
    element,
  }) => {
    const style = getComputedStyle(document.body);
    const canvas = (() => {
      if (previousVisualizerState) {
        return previousVisualizerState.canvas;
      }

      const canvas = document.createElement('canvas');
      element.appendChild(canvas);
      return canvas;
    })();

    const chart = (() => {
      if (previousVisualizerState) {
        return previousVisualizerState.chart;
      }

      return new Chart(canvas, {
        type: 'bar',
        options: {
          animation: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
        },
        data: {
          datasets: [],
        },
      });
    })();

    chart.data = {
      labels: array.map((number) => number.toString()),
      datasets: [
        {
          data: array,
          backgroundColor:
            backgroundColors ??
            `rgb(${style.getPropertyValue('--color-label')})`,
        },
      ],
    };

    chart.update();

    return { canvas, element, chart };
  },
});

export default barChart;
