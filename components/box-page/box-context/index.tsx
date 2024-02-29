import { SandboxBoxNamed } from '@app/playground/layout';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { Get, RecursivePath } from '@utils/RecursivePath';
import _, { mapValues } from 'lodash';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import useBoxContextConfig, {
  BoxContextConfig,
  defaultBoxContextConfig,
} from './config';
import useBoxContextAlgorithm, {
  BoxContextAlgorithm,
  defaultBoxContextAlgorithm,
} from './sandbox-object/algorithm';
import useBoxContextProblem, {
  BoxContextProblem,
  defaultBoxContextProblem,
} from './sandbox-object/problem';
import useBoxContextVisualizers, { BoxContextVisualizers } from './visualizers';

type BoxContextType = {
  problem: BoxContextProblem;
  algorithm: BoxContextAlgorithm;
  visualizers: BoxContextVisualizers;
  config: BoxContextConfig;
  openFlowchart: () => void;
  reset: () => void;
  boxName: {
    value: string;
    setValue: (value: string) => void;
  };
  saveAsNew: (name: string) => void;
  isDraft: boolean;
};

const BoxContext = createContext<BoxContextType>({
  algorithm: defaultBoxContextAlgorithm,
  problem: defaultBoxContextProblem,
  config: defaultBoxContextConfig,
  isDraft: true,
  reset: () => {},
  openFlowchart: () => {},
  boxName: {
    value: '',
    setValue: () => {},
  },
  saveAsNew: () => {},
  visualizers: {
    aliases: {},
    instances: {},
    order: [],
    appendAlias: () => {},
    setAlias: () => {},
    removeAlias: () => {},
    defaultParameters: {},
    reset: () => {},
  },
});

type BoxContextPath = RecursivePath<BoxContextType>;

type BoxContextReturn<P> = P extends undefined
  ? BoxContextType
  : Get<BoxContextType, P>;

export function useBoxContext<P extends BoxContextPath | undefined = undefined>(
  path?: P,
): BoxContextReturn<P> {
  const value = useContext(BoxContext);
  if (path === undefined) {
    return value as BoxContextReturn<P>;
  }
  return _.get(value, path) as BoxContextReturn<P>;
}

export type BoxContextProviderProps = {
  box: SandboxBoxNamed | null;
  onBoxUpdate?: (update: (oldBox: SandboxBoxNamed) => SandboxBoxNamed) => void;
  onBoxReset?: () => void;
  onBoxSaveAs?: (name: string) => Promise<void>;
  children: ReactNode;
};

export default function BoxContextProvider({
  box,
  onBoxUpdate,
  onBoxSaveAs,
  onBoxReset,
  children,
}: BoxContextProviderProps) {
  const { addOrFocusTab } = useTabManager();
  const sandboxComponents = useSandboxComponents();
  const {
    adapterOptions,
    algorithmOptions,
    problemOptions,
    visualizerOptions,
  } = sandboxComponents;

  const boxName = box?.name ?? 'Untitled box';

  const { algorithmKeyWithParameters, problemKeyWithParameters } =
    useMemo(() => {
      const {
        algorithm: algorithmKeyWithParameters,
        problem: problemKeyWithParameters,
      } = box ?? {};

      return {
        algorithmKeyWithParameters,
        problemKeyWithParameters,
      };
    }, [box]);

  const { key: problemKey, parameters: problemParameters } = useMemo(() => {
    if (problemKeyWithParameters === undefined) {
      return { key: undefined, parameters: undefined };
    }

    return parseKeyWithParameters(problemKeyWithParameters);
  }, [problemKeyWithParameters]);

  const problem = useBoxContextProblem({
    options: problemOptions,
    key: problemKey ?? null,
    onKeyChange: (key) => {
      if (key === null) {
        return;
      }

      onBoxUpdate?.((box) => ({
        ...box,
        problem: key,
      }));
    },
    parameters: problemParameters ?? null,
    onParametersChange: (parameters) => {
      if (problemKey === undefined) {
        return;
      }

      onBoxUpdate?.((box) => ({
        ...box,
        problem: parameters
          ? {
              key: problemKey ?? null,
              parameters,
            }
          : problemKey,
      }));
    },
  });

  const { key: algorithmKey = null, parameters: algorithmParameters = null } =
    useMemo(() => {
      if (algorithmKeyWithParameters === undefined) {
        return { key: undefined, parameters: undefined };
      }

      return parseKeyWithParameters(algorithmKeyWithParameters);
    }, [algorithmKeyWithParameters]);

  const algorithm = useBoxContextAlgorithm({
    options: algorithmOptions,
    key: algorithmKey,
    onKeyChange: (key) => {
      if (key === null) {
        return;
      }

      onBoxUpdate?.((box) => ({
        ...box,
        algorithm: key,
      }));
    },
    parameters: algorithmParameters,
    onParametersChange: (parameters) => {
      if (algorithmKey === null) {
        return;
      }

      onBoxUpdate?.((box) => ({
        ...box,
        algorithm: parameters
          ? {
              key: algorithmKey,
              parameters,
            }
          : algorithmKey,
      }));
    },
  });

  const defaultAliases = useMemo(
    () => box?.visualizers?.aliases ?? {},
    [box?.visualizers?.aliases],
  );
  const defaultOrder = useMemo(
    () => box?.visualizers?.order ?? [],
    [box?.visualizers?.order],
  );

  const visualizers = useBoxContextVisualizers({
    options: visualizerOptions,
    defaultAliases: defaultAliases,
    defaultOrder: defaultOrder,
    onAliasesChange: (aliases) => {
      onBoxUpdate?.((box) => ({
        ...box,
        visualizers: {
          order: box?.visualizers?.order ?? [],
          aliases,
        },
      }));
    },
    onOrderChange: (order) => {
      onBoxUpdate?.((box) => ({
        ...box,
        visualizers: {
          aliases: box?.visualizers?.aliases ?? {},
          order,
        },
      }));
    },
  });

  const visualizerInputKeys = useMemo(() => {
    return mapValues(visualizers.instances, (instance) => {
      return instance
        .map(({ value }) => {
          return Object.keys(value.accepts.shape.shape);
        })
        .unwrapOr([]);
    });
  }, [visualizers.instances]);

  const config = useBoxContextConfig({
    adapterOptions,
    value: box?.config ?? {
      composition: { type: 'flat', order: [] },
      adapters: {},
    },
    problemOutputKeys: Object.keys(
      problem.instance.unwrapOr(null)?.type.shape.shape ?? {},
    ),
    algorithmOutputKeys: Object.keys(
      algorithm.instance.unwrapOr(null)?.outputs.shape.shape ?? {},
    ),
    visualizerInputKeys,
    onChange: (newValue) => {
      onBoxUpdate?.((box) => ({
        ...box,
        config: newValue,
      }));
    },
  });

  const openFlowchart = useCallback(() => {
    addOrFocusTab({
      type: 'flowchart',
      label: `Visualizers: ${boxName}`,
    });
  }, [addOrFocusTab, boxName]);

  const value = useMemo(() => {
    return {
      problem,
      algorithm,
      config,
      openFlowchart,
      boxName: {
        value: boxName,
        setValue: (newName) => {
          onBoxUpdate?.((box) => ({ ...box, name: newName }));
        },
      },
      isDraft: box === undefined,
      reset: () => {
        onBoxReset?.();
      },
      saveAsNew: (name: string) => {
        onBoxSaveAs?.(name);
      },
      visualizers,
    } as BoxContextType;
  }, [
    algorithm,
    config,
    box,
    boxName,
    onBoxReset,
    onBoxSaveAs,
    onBoxUpdate,
    openFlowchart,
    problem,
    visualizers,
  ]);

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}
