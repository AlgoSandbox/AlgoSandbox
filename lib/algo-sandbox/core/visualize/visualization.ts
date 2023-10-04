type VisualizationContext = {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
};

export type Visualization = {
  onUpdate: (context: VisualizationContext) => void;
};
