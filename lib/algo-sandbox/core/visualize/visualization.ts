type SandboxVisualizationContext<V> = {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  previousVisualizerState: V | null;
};

export type SandboxVisualization<V> = {
  onUpdate: (context: SandboxVisualizationContext<V>) => V;
};
