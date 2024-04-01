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
        previousVisualizerState.chart.data.labels = array.map((number) =>
          number.toString(),
        );
        previousVisualizerState.chart.data.datasets[0].data = array;
        previousVisualizerState.chart.data.datasets[0].backgroundColor =
          backgroundColors;
        previousVisualizerState.chart.update();
        return previousVisualizerState.chart;
      }

      return new Chart(canvas, {
        type: 'bar',
        options: {
          animation: {
            duration: 200,
          },
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
          labels: array.map((number) => number.toString()),
          datasets: [
            {
              data: array,
              backgroundColor: backgroundColors,
            },
          ],
        },
      });
    })();

    return { canvas, element, chart };
  },
});

export default barChart;
