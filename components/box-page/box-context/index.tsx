import { ComponentTag } from '@algo-sandbox/core';
import { SandboxBoxNamed } from '@app/playground/PlaygroundLayout';
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
  useEffect,
  useMemo,
  useState,
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
  save: (options: {
    name: string;
    tags: Array<ComponentTag>;
    asNew: boolean;
  }) => Promise<void>;
  delete: () => Promise<void>;
  isBoxCustom: boolean;
  isBoxDirty: boolean;
  box: SandboxBoxNamed | null;
  hiddenVisualizerAliases: Set<string>;
  setHiddenVisualizerAliases: (aliases: Set<string>) => void;
  componentNames: Record<string, string | undefined>;
  setComponentNames: (
    componentNames: Record<string, string | undefined>,
  ) => void;
};

const BoxContext = createContext<BoxContextType>({
  algorithm: defaultBoxContextAlgorithm,
  problem: defaultBoxContextProblem,
  config: defaultBoxContextConfig,
  isBoxCustom: false,
  isBoxDirty: false,
  reset: () => {},
  openFlowchart: () => {},
  box: null,
  boxName: {
    value: '',
    setValue: () => {},
  },
  save: async () => {},
  delete: async () => {},
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
  hiddenVisualizerAliases: new Set(),
  setHiddenVisualizerAliases: () => {},
  componentNames: {},
  setComponentNames: () => {},
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
  onBoxUpdate: (update: (oldBox: SandboxBoxNamed) => SandboxBoxNamed) => void;
  onBoxReset: () => void;
  onBoxSave: (options: {
    name: string;
    tags: Array<ComponentTag>;
    asNew: boolean;
  }) => Promise<void>;
  onBoxDelete: () => Promise<void>;
  isBoxCustom: boolean;
  isBoxDirty: boolean;
  children: ReactNode;
};

export default function BoxContextProvider({
  box,
  onBoxUpdate,
  onBoxSave,
  onBoxReset,
  onBoxDelete,
  isBoxCustom,
  isBoxDirty,
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

  const algorithmKeyWithParameters = box?.algorithm;
  const problemKeyWithParameters = box?.problem;

  const { key: problemKey, parameters: problemParameters } = useMemo(() => {
    if (problemKeyWithParameters === undefined) {
      return { key: undefined, parameters: undefined };
    }

    return parseKeyWithParameters(problemKeyWithParameters);
  }, [problemKeyWithParameters]);

  const boxContextProblemArgs = useMemo(() => {
    const args: Parameters<typeof useBoxContextProblem>[0] = {
      options: problemOptions,
      key: problemKey ?? null,
      onChange: (key, parameters) => {
        if (key === null) {
          return;
        }

        onBoxUpdate((box) => ({
          ...box,
          problem: parameters
            ? {
                key,
                parameters,
              }
            : key,
        }));
      },
      parameters: problemParameters ?? null,
    };

    return args;
  }, [problemOptions, problemKey, problemParameters, onBoxUpdate]);

  const problem = useBoxContextProblem(boxContextProblemArgs);

  const { key: algorithmKey = null, parameters: algorithmParameters = null } =
    useMemo(() => {
      if (algorithmKeyWithParameters === undefined) {
        return { key: undefined, parameters: undefined };
      }

      return parseKeyWithParameters(algorithmKeyWithParameters);
    }, [algorithmKeyWithParameters]);

  const boxContextAlgorithmArgs = useMemo(() => {
    const args: Parameters<typeof useBoxContextAlgorithm>[0] = {
      options: algorithmOptions,
      key: algorithmKey,
      onChange: (key, parameters) => {
        if (key === null) {
          return;
        }

        onBoxUpdate((box) => ({
          ...box,
          algorithm: parameters
            ? {
                key,
                parameters,
              }
            : key,
        }));
      },
      parameters: algorithmParameters,
    };

    return args;
  }, [algorithmOptions, algorithmKey, algorithmParameters, onBoxUpdate]);

  const algorithm = useBoxContextAlgorithm(boxContextAlgorithmArgs);

  const defaultAliases = useMemo(
    () => box?.visualizers?.aliases ?? {},
    [box?.visualizers?.aliases],
  );
  const defaultOrder = useMemo(
    () => box?.visualizers?.order ?? [],
    [box?.visualizers?.order],
  );

  const [hiddenVisualizerAliases, setHiddenVisualizerAliases] = useState<
    Set<string>
  >(new Set());

  const boxContextVisualizersArgs = useMemo(() => {
    const args: Parameters<typeof useBoxContextVisualizers>[0] = {
      options: visualizerOptions,
      defaultAliases: defaultAliases,
      defaultOrder: defaultOrder,
      onAliasesChange: (aliases) => {
        onBoxUpdate((box) => ({
          ...box,
          visualizers: {
            order: box?.visualizers?.order ?? [],
            aliases,
          },
        }));
      },
      onOrderChange: (order) => {
        onBoxUpdate((box) => ({
          ...box,
          visualizers: {
            aliases: box?.visualizers?.aliases ?? {},
            order,
          },
        }));
      },
    };

    return args;
  }, [visualizerOptions, defaultAliases, defaultOrder, onBoxUpdate]);

  const visualizers = useBoxContextVisualizers(boxContextVisualizersArgs);

  useEffect(() => {
    setHiddenVisualizerAliases(new Set());
  }, [visualizers.aliases]);

  const visualizerInputKeys = useMemo(() => {
    return mapValues(visualizers.instances, (instance) => {
      return instance
        .map(({ value }) => {
          return Object.keys(value.accepts.shape.shape);
        })
        .unwrapOr([]);
    });
  }, [visualizers.instances]);

  const boxContextConfigArgs = useMemo(() => {
    const args: Parameters<typeof useBoxContextConfig>[0] = {
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
        onBoxUpdate((box) => ({
          ...box,
          config: newValue,
        }));
      },
    };

    return args;
  }, [
    adapterOptions,
    box?.config,
    problem.instance,
    algorithm.instance,
    visualizerInputKeys,
    onBoxUpdate,
  ]);

  const config = useBoxContextConfig(boxContextConfigArgs);

  const openFlowchart = useCallback(() => {
    addOrFocusTab({
      type: 'flowchart',
      label: `Visualizers: ${boxName}`,
    });
  }, [addOrFocusTab, boxName]);

  const componentNames = useMemo(() => {
    return box?.componentNames ?? {};
  }, [box?.componentNames]);

  const setComponentNames = useCallback(
    (componentNames: Record<string, string | undefined>) => {
      onBoxUpdate((box) => ({
        ...box,
        componentNames,
      }));
    },
    [onBoxUpdate],
  );

  const value = useMemo(() => {
    return {
      problem,
      algorithm,
      config,
      openFlowchart,
      boxName: {
        value: boxName,
        setValue: (newName) => {
          onBoxUpdate((box) => ({ ...box, name: newName }));
        },
      },
      isBoxCustom,
      isBoxDirty,
      reset: () => {
        onBoxReset();
      },
      save: onBoxSave,
      delete: onBoxDelete,
      visualizers,
      box,
      hiddenVisualizerAliases,
      setHiddenVisualizerAliases,
      componentNames,
      setComponentNames,
    } as BoxContextType;
  }, [
    problem,
    algorithm,
    config,
    openFlowchart,
    boxName,
    isBoxCustom,
    isBoxDirty,
    onBoxSave,
    onBoxDelete,
    visualizers,
    box,
    hiddenVisualizerAliases,
    componentNames,
    setComponentNames,
    onBoxUpdate,
    onBoxReset,
  ]);

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}
