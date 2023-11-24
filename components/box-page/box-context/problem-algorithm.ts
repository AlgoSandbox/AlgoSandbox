import { adapterOptions } from '@constants/catalog';
import { useMemo } from 'react';

import {
  BoxContextAdapters,
  defaultBoxContextAdapters,
  useBoxContextAdapters,
} from './adapters';
import { BoxContextAlgorithm } from './sandbox-object/algorithm';
import { BoxContextProblem } from './sandbox-object/problem';

export type BoxContextProblemAlgorithm = {
  compatible: boolean;
  adapters: BoxContextAdapters;
};

export const defaultBoxContextProblemAlgorithm: BoxContextProblemAlgorithm = {
  compatible: false,
  adapters: defaultBoxContextAdapters,
};

export default function useBoxContextProblemAlgorithm({
  algorithm,
  problem,
}: {
  algorithm: BoxContextAlgorithm;
  problem: BoxContextProblem;
}) {
  const adapters = useBoxContextAdapters(adapterOptions);
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
          problem.instance.type.name === composedAdapter?.accepts.name &&
          composedAdapter?.outputs === algorithm.instance.accepts),
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
