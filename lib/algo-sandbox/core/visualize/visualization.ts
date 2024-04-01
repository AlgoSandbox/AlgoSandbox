export type SandboxVisualizationContext<V> = {
  element: HTMLElement;
  width: number;
  height: number;
  previousVisualizerState: V | null;
};

export type SandboxVisualization<V> = {
  onUpdate: (context: SandboxVisualizationContext<V>) => V;
};
