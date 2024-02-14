import { SandboxVisualization } from '@algo-sandbox/core';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

export type VisualizationRendererProps<V> = {
  className?: string;
  visualization: SandboxVisualization<V>;
};

export default function VisualizationRenderer<V>({
  className,
  visualization: { onUpdate },
}: VisualizationRendererProps<V>) {
  const [divElement, setDivElement] = useState<HTMLDivElement | null>(null);
  const divRef = useCallback((divElement: HTMLDivElement) => {
    setDivElement(divElement);
  }, []);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [visualizerState, setVisualizerState] = useState<V | null>(null);

  useEffect(() => {
    if (!divElement) {
      return;
    }

    const handleResize = () => {
      const { width, height } = divElement.getBoundingClientRect();
      setWidth(width);
      setHeight(height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(divElement);

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [divElement, divRef]);

  useEffect(() => {
    if (divElement === null) {
      return;
    }

    try {
      const newVisualizerState = onUpdate({
        element: divElement,
        width,
        height,
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
  }, [divElement, height, onUpdate, visualizerState, width]);

  return <div ref={divRef} className={className} />;
}
