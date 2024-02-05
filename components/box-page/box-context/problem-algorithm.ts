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
import { BoxContextProblem } from './sandbox-object/problem';

export type BoxContextProblemAlgorithm = {
  adapters: BoxContextAdapters;
  compatible: boolean;
};

export const defaultBoxContextProblemAlgorithm: BoxContextProblemAlgorithm = {
  adapters: defaultBoxContextAdapters,
  compatible: false,
};

export default function useBoxContextProblemAlgorithm({
  algorithm,
  builtInAdapterOptions,
  problem,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  algorithm: BoxContextAlgorithm;
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  problem: BoxContextProblem;
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

  const problemAlgorithm = useMemo(() => {
    return {
      compatible:
        (composedAdapter === null &&
          algorithm.instance !== null &&
          problem.instance !== null &&
          problem.instance.type.name === algorithm.instance.accepts.name) ||
        (!hasInvalidAdapter &&
          algorithm.instance !== null &&
          problem.instance !== null &&
          composedAdapter !== null &&
          problem.instance.type.name === composedAdapter.accepts.name &&
          composedAdapter.outputs === algorithm.instance.accepts),
      adapters,
    } satisfies BoxContextProblemAlgorithm;
  }, [
    adapters,
    algorithm.instance,
    composedAdapter,
    hasInvalidAdapter,
    problem.instance,
  ]);

  return problemAlgorithm;
}
