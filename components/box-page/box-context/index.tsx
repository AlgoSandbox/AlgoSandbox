import { CatalogGroup } from '@constants/catalog';
import { DbAlgorithmSaved, DbProblemSaved, DbVisualizerSaved } from '@utils/db';
import _ from 'lodash';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import useBoxContextAlgorithmVisualizer, {
  BoxContextAlgorithmVisualizer,
  defaultBoxContextAlgorithmVisualizer,
} from './algorithm-visualizer';
import useBoxContextProblemAlgorithm, {
  BoxContextProblemAlgorithm,
  defaultBoxContextProblemAlgorithm,
} from './problem-algorithm';
import useBoxContextAlgorithm, {
  BoxContextAlgorithm,
  defaultBoxContextAlgorithm,
} from './sandbox-object/algorithm';
import useBoxContextProblem, {
  BoxContextProblem,
  defaultBoxContextProblem,
} from './sandbox-object/problem';
import useBoxContextVisualizer, {
  BoxContextVisualizer,
  defaultBoxContextVisualizer,
} from './sandbox-object/visualizer';

type BoxContextType = {
  problem: BoxContextProblem;
  problemAlgorithm: BoxContextProblemAlgorithm;
  algorithm: BoxContextAlgorithm;
  algorithmVisualizer: BoxContextAlgorithmVisualizer;
  visualizer: BoxContextVisualizer;
  customPanelType: CustomPanel | null;
};

const BoxContext = createContext<BoxContextType>({
  algorithm: defaultBoxContextAlgorithm,
  problem: defaultBoxContextProblem,
  problemAlgorithm: defaultBoxContextProblemAlgorithm,
  algorithmVisualizer: defaultBoxContextAlgorithmVisualizer,
  visualizer: defaultBoxContextVisualizer,
  customPanelType: null,
});

type Paths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

type Get<
  T extends Record<string, unknown>,
  P,
> = P extends `${infer K}.${infer Rest}`
  ? T[K] extends Record<string, unknown>
    ? Get<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

type BoxContextPath = Paths<BoxContextType>;

type BoxContextReturn<P> = P extends undefined
  ? BoxContextType
  : Get<BoxContextType, P>;

export function useBoxContext<P extends BoxContextPath | undefined = undefined>(
  path?: P
): BoxContextReturn<P> {
  const value = useContext(BoxContext);
  if (path === undefined) {
    return value as BoxContextReturn<P>;
  }
  return _.get(value, path) as BoxContextReturn<P>;
}

type CustomPanel = 'algorithm' | 'problem' | 'visualizer' | null;

export type BoxContextProviderProps = {
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
  builtInVisualizerOptions: Array<CatalogGroup<DbVisualizerSaved>>;
  children: ReactNode;
};

export default function BoxContextProvider({
  builtInAlgorithmOptions,
  builtInProblemOptions,
  builtInVisualizerOptions,
  children,
}: BoxContextProviderProps) {
  const [customPanel, setCustomPanel] = useState<CustomPanel>(null);
  const {
    customAlgorithmPanelVisible,
    customProblemPanelVisible,
    customVisualizerPanelVisible,
    setCustomAlgorithmPanelVisible,
    setCustomProblemPanelVisible,
    setCustomVisualizerPanelVisible,
  } = useMemo(() => {
    return {
      customAlgorithmPanelVisible: customPanel === 'algorithm',
      customProblemPanelVisible: customPanel === 'problem',
      customVisualizerPanelVisible: customPanel === 'visualizer',
      setCustomAlgorithmPanelVisible: (visible: boolean) => {
        setCustomPanel(visible ? 'algorithm' : null);
      },
      setCustomVisualizerPanelVisible: (visible: boolean) => {
        setCustomPanel(visible ? 'visualizer' : null);
      },
      setCustomProblemPanelVisible: (visible: boolean) => {
        setCustomPanel(visible ? 'problem' : null);
      },
    };
  }, [customPanel]);

  const problem = useBoxContextProblem({
    builtInProblemOptions,
    customPanelVisible: customProblemPanelVisible,
    setCustomPanelVisible: setCustomProblemPanelVisible,
  });
  const algorithm = useBoxContextAlgorithm({
    builtInAlgorithmOptions,
    customPanelVisible: customAlgorithmPanelVisible,
    setCustomPanelVisible: setCustomAlgorithmPanelVisible,
  });
  const visualizer = useBoxContextVisualizer({
    builtInVisualizerOptions,
    customPanelVisible: customVisualizerPanelVisible,
    setCustomPanelVisible: setCustomVisualizerPanelVisible,
  });
  const problemAlgorithm = useBoxContextProblemAlgorithm({
    algorithm,
    problem,
  });
  const algorithmVisualizer = useBoxContextAlgorithmVisualizer({
    algorithm,
    visualizer,
  });

  const value = useMemo(() => {
    return {
      problem,
      problemAlgorithm,
      algorithm,
      algorithmVisualizer,
      visualizer,
      customPanelType: customPanel,
    } satisfies BoxContextType;
  }, [
    algorithm,
    algorithmVisualizer,
    customPanel,
    problem,
    problemAlgorithm,
    visualizer,
  ]);

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}
