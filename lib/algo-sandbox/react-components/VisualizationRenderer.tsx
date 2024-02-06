import { SandboxVisualization } from '@algo-sandbox/core';
import * as d3 from 'd3';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

export type VisualizationRendererProps<V> = {
  className?: string;
  visualization: SandboxVisualization<V>;
  zoomLevel?: number;
};

export default function VisualizationRenderer<V>({
  className,
  visualization: { onUpdate },
  zoomLevel = 1,
}: VisualizationRendererProps<V>) {
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);
  const [svg, setSvg] = useState<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    unknown
  > | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [visualizerState, setVisualizerState] = useState<V | null>(null);

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

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(svgElement);

    handleResize();

    return () => {
      resizeObserver.disconnect();
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
      const newVisualizerState = onUpdate({
        svg,
        width: zoomedWidth,
        height: zoomedHeight,
        previousVisualizerState: visualizerState,
      });

      if (isEqual(newVisualizerState, visualizerState)) {
        return;
      }
      setVisualizerState(newVisualizerState);
    } catch (e) {
      // TODO: Display error
      console.error(e);
    }
  }, [onUpdate, svg, visualizerState, zoomedHeight, zoomedWidth]);

  return <svg ref={svgRef} className={className} />;
}
