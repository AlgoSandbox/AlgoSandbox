import { Visualization } from '.';

export type Visualizer<T> = {
  visualize: (state: T) => Visualization;
};
