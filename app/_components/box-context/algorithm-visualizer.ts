import { adapterOptions } from '@constants/catalog';
import { useMemo } from 'react';
import { BoxContextVisualizer } from './visualizer';
import {
  BoxContextAdapters,
  defaultBoxContextAdapters,
  useBoxContextAdapters,
} from './adapters';
import { BoxContextAlgorithm } from './algorithm';

export const defaultBoxContextAlgorithmVisualizer: BoxContextAlgorithmVisualizer =
  {
    compatible: false,
    adapters: defaultBoxContextAdapters,
  };

export type BoxContextAlgorithmVisualizer = {
  compatible: boolean;
  adapters: BoxContextAdapters;
};

export default function useBoxContextAlgorithmVisualizer({
  visualizer,
  algorithm,
}: {
  algorithm: BoxContextAlgorithm;
  visualizer: BoxContextVisualizer;
}) {
  const adapters = useBoxContextAdapters(adapterOptions);
  const { composed: composedAdapter, value: adapterList } = adapters;
  const hasInvalidAdapter = adapterList.length > 0 && composedAdapter === null;

  const algorithmVisualizer = useMemo(() => {
    return {
      compatible:
        (composedAdapter === null &&
          algorithm.instance !== null &&
          visualizer.instance.accepts === algorithm.instance.outputs) ||
        (!hasInvalidAdapter &&
          algorithm.instance !== null &&
          algorithm.instance.outputs === composedAdapter?.accepts &&
          composedAdapter?.outputs === visualizer.instance.accepts),
      adapters,
    } satisfies BoxContextAlgorithmVisualizer;
  }, [
    adapters,
    algorithm.instance,
    composedAdapter,
    hasInvalidAdapter,
    visualizer.instance.accepts,
  ]);

  return algorithmVisualizer;
}
