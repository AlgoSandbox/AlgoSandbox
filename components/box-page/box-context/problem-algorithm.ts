import { AdapterConfigurationFlat } from '@algo-sandbox/core';
import { CatalogGroup } from '@constants/catalog';
import areStateTypesCompatible from '@utils/areStateTypesCompatible';
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
  const { composed: composedAdapter } = adapters;

  const problemInstance = problem.instance.mapLeft(() => null).value;
  const algorithmInstance = algorithm.instance.mapLeft(() => null).value;

  const compatible = useMemo(() => {
    const isComposedAdapterInvalid = composedAdapter.isLeft();

    if (isComposedAdapterInvalid) {
      return false;
    }

    if (algorithmInstance === null || problemInstance === null) {
      return false;
    }

    const composed = composedAdapter.unwrap();

    if (composed === null) {
      return areStateTypesCompatible({
        to: algorithmInstance.accepts,
        from: problemInstance.type,
      });
    }

    return (
      areStateTypesCompatible({
        to: problemInstance.type,
        from: composed.accepts,
      }) &&
      areStateTypesCompatible({
        to: composed.outputs,
        from: algorithmInstance.accepts,
      })
    );
  }, [algorithmInstance, composedAdapter, problemInstance]);

  const problemAlgorithm = useMemo(() => {
    return {
      compatible,
      adapters,
    } satisfies BoxContextProblemAlgorithm;
  }, [adapters, compatible]);

  return problemAlgorithm;
}
