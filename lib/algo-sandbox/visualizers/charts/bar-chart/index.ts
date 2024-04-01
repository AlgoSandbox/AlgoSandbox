import { createVisualizer, SandboxStateType } from '@algo-sandbox/core';
import Chart from 'chart.js/auto';
import { z } from 'zod';

const arrayType = {
  name: 'array',
  shape: z.object({
    array: z.array(z.number()),
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
  name: 'Array 1D',
  accepts: arrayType,
  onUpdate: ({ state: { array }, previousVisualizerState, element }) => {
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
        previousVisualizerState.chart.update();
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
          labels: array.map((number) => number.toString()),
          datasets: [
            {
              data: array,
            },
          ],
        },
      });
    })();

    return { canvas, element, chart };
  },
});

export default barChart;
