import { useMemo } from 'react';
import { BoxContextAlgorithm } from './algorithm';
import { BoxContextProblem } from './problem';

export type BoxContextProblemAlgorithm = {
  compatible: boolean;
};

export const defaultBoxContextProblemAlgorithm: BoxContextProblemAlgorithm = {
  compatible: false,
};

export default function useBoxContextProblemAlgorithm({
  algorithm,
  problem,
}: {
  algorithm: BoxContextAlgorithm;
  problem: BoxContextProblem;
}) {
  const problemAlgorithm = useMemo(() => {
    return {
      compatible: algorithm.instance.accepts === problem.instance.shape,
    } satisfies BoxContextProblemAlgorithm;
  }, [algorithm.instance.accepts, problem.instance.shape]);

  return problemAlgorithm;
}
