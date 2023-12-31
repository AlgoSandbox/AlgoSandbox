import { SandboxVisualization } from '@algo-sandbox/core';
import * as d3 from 'd3';
import React, { useCallback, useEffect, useState } from 'react';

export type VisualizationRendererProps = {
  className?: string;
  visualization: SandboxVisualization;
  zoomLevel?: number;
};

export default function VisualizationRenderer({
  className,
  visualization: { onUpdate },
  zoomLevel = 1,
}: VisualizationRendererProps) {
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);
  const [svg, setSvg] = useState<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    unknown
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

  const zoomedWidth = width / zoomLevel;
  const zoomedHeight = height / zoomLevel;

  useEffect(() => {
    if (svg === null) {
      return;
    }

    try {
      svg.attr('viewBox', [
        -zoomedWidth / 2,
        -zoomedHeight / 2,
        zoomedWidth,
        zoomedHeight,
      ]);
      svg.selectChildren().remove();
      onUpdate({ svg, width: zoomedWidth, height: zoomedHeight });
    } catch (e) {
      // TODO: Display error
      console.error(e);
    }
  }, [onUpdate, svg, zoomedHeight, zoomedWidth]);

  return <svg ref={svgRef} className={className} />;
}
