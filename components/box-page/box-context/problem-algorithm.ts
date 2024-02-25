import { AdapterConfigurationFlat } from '@algo-sandbox/core';
import { CatalogGroup } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { isEqual } from 'lodash';
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
  adapterOptions,
  problem,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  algorithm: BoxContextAlgorithm;
  adapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  problem: BoxContextProblem;
  adapterConfiguration: AdapterConfigurationFlat;
  onAdapterConfigurationChange: (config: AdapterConfigurationFlat) => void;
}) {
  const adapters = useBoxContextAdapters({
    options: adapterOptions,
    adapterConfiguration,
    onAdapterConfigurationChange,
  });
  const { composed: composedAdapter, value: adapterList } = adapters;
  const hasInvalidAdapter = adapterList.length > 0 && composedAdapter === null;

  const problemInstance = problem.instance.mapLeft(() => null).value;
  const algorithmInstance = algorithm.instance.mapLeft(() => null).value;

  const problemAlgorithm = useMemo(() => {
    return {
      compatible:
        (composedAdapter === null &&
          algorithmInstance !== null &&
          problemInstance !== null &&
          isEqual(
            Object.keys(problemInstance.type.shape.shape),
            Object.keys(algorithmInstance.accepts.shape.shape),
          )) ||
        (!hasInvalidAdapter &&
          algorithmInstance !== null &&
          problemInstance !== null &&
          composedAdapter !== null &&
          isEqual(
            Object.keys(problemInstance.type.shape.shape),
            Object.keys(composedAdapter.accepts.shape.shape),
          ) &&
          isEqual(
            Object.keys(composedAdapter.outputs.shape.shape),
            Object.keys(algorithmInstance.accepts.shape.shape),
          )),
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
