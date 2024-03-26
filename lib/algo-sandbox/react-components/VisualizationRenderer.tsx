import { SandboxVisualization } from '@algo-sandbox/core';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

export type VisualizationRendererProps<V> = {
  className?: string;
  visualization: SandboxVisualization<V>;
  zoom?: number;
};

export default function VisualizationRenderer<V>({
  className,
  visualization: { onUpdate },
  zoom = 1,
}: VisualizationRendererProps<V>) {
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [divElement, setDivElement] = useState<HTMLDivElement | null>(null);
  const divRef = useCallback((divElement: HTMLDivElement) => {
    setDivElement(divElement);
  }, []);
  const containerRef = useCallback((containerElement: HTMLDivElement) => {
    setContainerElement(containerElement);
  }, []);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [visualizerState, setVisualizerState] = useState<V | null>(null);

  useEffect(() => {
    if (!containerElement) {
      return;
    }

    const handleResize = () => {
      const { width, height } = containerElement.getBoundingClientRect();
      setWidth(width / zoom);
      setHeight(height / zoom);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(containerElement);

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerElement, divElement, divRef, zoom]);

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

  return (
    <div ref={containerRef} className={className}>
      <div
        ref={divRef}
        style={{
          width,
          height,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </div>
  );
}
