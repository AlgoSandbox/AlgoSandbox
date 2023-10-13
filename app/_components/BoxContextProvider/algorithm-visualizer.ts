import { adapterOptions } from '@/app/_constants/catalog';
import { useMemo } from 'react';
import visualizer, { BoxContextVisualizer } from './visualizer';
import { SelectOption, SelectOptions } from '@/components/Select';
import {
  SandboxCompositeAdapter,
  SandboxStateNameMap,
  SandboxAdapter,
  SandboxStateName,
} from '@/lib/algo-sandbox/core';
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
          visualizer.instance.accepts === algorithm.instance.outputs) ||
        (!hasInvalidAdapter &&
          algorithm.instance.outputs === composedAdapter?.accepts &&
          composedAdapter?.outputs === visualizer.instance.accepts),
      adapters,
    } satisfies BoxContextAlgorithmVisualizer;
  }, [
    adapters,
    algorithm.instance.outputs,
    composedAdapter,
    hasInvalidAdapter,
    visualizer.instance.accepts,
  ]);

  return algorithmVisualizer;
}
