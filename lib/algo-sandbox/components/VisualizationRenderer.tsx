import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SandboxVisualization } from '../core';

export type VisualizationRendererProps = {
  className?: string;
  visualization: SandboxVisualization;
};

export default function VisualizationRenderer({
  className,
  visualization: { onUpdate },
}: VisualizationRendererProps) {
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);
  const [svg, setSvg] = useState<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const svgRef = useCallback((svgElement: SVGSVGElement) => {
    setSvgElement(svgElement);
  }, []);

  useEffect(() => {
    if (!svgElement) {
      return;
    }

    setSvg(d3.select(svgElement));

    const handleResize = () => {
      const { width, height } = svgElement.getBoundingClientRect();
      setWidth(width);
      setHeight(height);
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      setSvg(null);
    };
  }, [svgElement]);

  useEffect(() => {
    if (svg === null) {
      return;
    }
    onUpdate({ svg, width, height });
  }, [height, onUpdate, svg, width]);

  return <svg ref={svgRef} className={className} />;
}
