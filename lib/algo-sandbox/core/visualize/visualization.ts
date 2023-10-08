type SandboxVisualizationContext = {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
};

export type SandboxVisualization = {
  onUpdate: (context: SandboxVisualizationContext) => void;
};
