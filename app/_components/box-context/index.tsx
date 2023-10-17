import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import _ from 'lodash';
import {
  BoxContextAlgorithm,
  defaultBoxContextAlgorithm,
  useBoxContextAlgorithm,
} from './algorithm';
import {
  BoxContextProblem,
  defaultBoxContextProblem,
  useBoxContextProblem,
} from './problem';
import useBoxContextVisualizer, {
  BoxContextVisualizer,
  defaultBoxContextVisualizer,
} from './visualizer';
import useBoxContextAlgorithmVisualizer, {
  BoxContextAlgorithmVisualizer,
  defaultBoxContextAlgorithmVisualizer,
} from './algorithm-visualizer';
import useBoxContextProblemAlgorithm, {
  BoxContextProblemAlgorithm,
  defaultBoxContextProblemAlgorithm,
} from './problem-algorithm';

type BoxContextType = {
  problem: BoxContextProblem;
  problemAlgorithm: BoxContextProblemAlgorithm;
  algorithm: BoxContextAlgorithm;
  algorithmVisualizer: BoxContextAlgorithmVisualizer;
  visualizer: BoxContextVisualizer;
};

const BoxContext = createContext<BoxContextType>({
  algorithm: defaultBoxContextAlgorithm,
  problem: defaultBoxContextProblem,
  problemAlgorithm: defaultBoxContextProblemAlgorithm,
  algorithmVisualizer: defaultBoxContextAlgorithmVisualizer,
  visualizer: defaultBoxContextVisualizer,
});

type Paths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

type Get<
  T extends Record<string, any>,
  P
> = P extends `${infer K}.${infer Rest}`
  ? Get<T[K], Rest>
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

type CustomPanel = 'algorithm' | null;

export type BoxContextProviderProps = {
  children: ReactNode;
};

export default function BoxContextProvider({
  children,
}: BoxContextProviderProps) {
  const [customPanel, setCustomPanel] = useState<CustomPanel>(null);
  const { customAlgorithmPanelVisible, setCustomAlgorithmPanelVisible } =
    useMemo(() => {
      return {
        setCustomAlgorithmPanelVisible: (visible: boolean) => {
          setCustomPanel(visible ? 'algorithm' : null);
        },
        customAlgorithmPanelVisible: customPanel === 'algorithm',
      };
    }, [customPanel]);

  const problem = useBoxContextProblem();
  const algorithm = useBoxContextAlgorithm({
    customPanelVisible: customAlgorithmPanelVisible,
    setCustomPanelVisible: setCustomAlgorithmPanelVisible,
  });
  const visualizer = useBoxContextVisualizer();
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
    } satisfies BoxContextType;
  }, [algorithm, algorithmVisualizer, problem, problemAlgorithm, visualizer]);

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}