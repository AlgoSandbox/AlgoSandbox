import { AdapterConfiguration } from '@algo-sandbox/core';
import { CatalogGroup } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { useMemo } from 'react';

import {
  BoxContextAdapters,
  defaultBoxContextAdapters,
  useBoxContextAdapters,
} from './adapters';
import { BoxContextAlgorithm } from './sandbox-object/algorithm';
import { BoxContextVisualizer } from './sandbox-object/visualizer';

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
  algorithm,
  builtInAdapterOptions,
  visualizer,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  algorithm: BoxContextAlgorithm;
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  visualizer: BoxContextVisualizer;
  adapterConfiguration: AdapterConfiguration;
  onAdapterConfigurationChange: (config: AdapterConfiguration) => void;
}) {
  const adapters = useBoxContextAdapters({
    builtInOptions: builtInAdapterOptions,
    adapterConfiguration,
    onAdapterConfigurationChange,
  });
  const { composed: composedAdapter, value: adapterList } = adapters;
  const hasInvalidAdapter = adapterList.length > 0 && composedAdapter === null;

  const algorithmVisualizer = useMemo(() => {
    return {
      compatible:
        (composedAdapter === null &&
          algorithm.instance !== null &&
          visualizer.instance !== null &&
          visualizer.instance.accepts.name ===
            algorithm.instance.outputs.name) ||
        (!hasInvalidAdapter &&
          algorithm.instance !== null &&
          visualizer.instance !== null &&
          algorithm.instance.outputs.name === composedAdapter?.accepts.name &&
          composedAdapter?.outputs.name === visualizer.instance.accepts.name),
      adapters,
    } satisfies BoxContextAlgorithmVisualizer;
  }, [
    adapters,
    algorithm.instance,
    composedAdapter,
    hasInvalidAdapter,
    visualizer.instance,
  ]);

  return algorithmVisualizer;
}
