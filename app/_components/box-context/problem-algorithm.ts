import { useMemo } from 'react';
import { BoxContextAlgorithm } from './algorithm';
import { BoxContextProblem } from './problem';
import {
  BoxContextAdapters,
  defaultBoxContextAdapters,
  useBoxContextAdapters,
} from './adapters';
import { adapterOptions } from '@constants/catalog';

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
          problem.instance.shape === algorithm.instance.accepts) ||
        (!hasInvalidAdapter &&
          algorithm.instance !== null &&
          problem.instance.shape === composedAdapter?.accepts &&
          composedAdapter?.outputs === algorithm.instance.accepts),
      adapters,
    } satisfies BoxContextProblemAlgorithm;
  }, [
    adapters,
    algorithm.instance,
    composedAdapter,
    hasInvalidAdapter,
    problem.instance.shape,
  ]);

  return problemAlgorithm;
}
