import { AdapterConfigurationFlat } from '@algo-sandbox/core';
import { SandboxBoxNamed } from '@app/BoxManager';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import getCustomDbObjectName from '@utils/getCustomDbObjectName';
import { Get, RecursivePath } from '@utils/RecursivePath';
import _, { isEqual, mapValues } from 'lodash';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import useBoxContextAlgorithmVisualizers, {
  BoxContextAlgorithmVisualizers,
  defaultBoxContextAlgorithmVisualizer as defaultBoxContextAlgorithmVisualizers,
} from './algorithm-visualizers';
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
import useBoxContextVisualizers, { BoxContextVisualizers } from './visualizers';

type BoxContextType = {
  problem: BoxContextProblem;
  problemAlgorithm: BoxContextProblemAlgorithm;
  algorithm: BoxContextAlgorithm;
  algorithmVisualizers: BoxContextAlgorithmVisualizers;
  visualizers: BoxContextVisualizers;
  boxEnvironment: {
    value: Record<string, string>;
    setValue: (value: Record<string, string>) => void;
  };
  openBoxEditor: () => void;
  openFlowchart: () => void;
  reset: () => void;
  boxName: {
    value: string;
    setValue: (value: string) => void;
  };
  isDraft: boolean;
};

const BoxContext = createContext<BoxContextType>({
  algorithm: defaultBoxContextAlgorithm,
  problem: defaultBoxContextProblem,
  problemAlgorithm: defaultBoxContextProblemAlgorithm,
  algorithmVisualizers: defaultBoxContextAlgorithmVisualizers,
  isDraft: true,
  boxEnvironment: {
    value: {},
    setValue: () => {},
  },
  reset: () => {},
  openBoxEditor: () => {},
  openFlowchart: () => {},
  boxName: {
    value: '',
    setValue: () => {},
  },
  visualizers: {
    aliases: {},
    instances: {},
    order: [],
    appendAlias: () => {},
    setAlias: () => {},
    removeAlias: () => {},
    parameters: {
      value: {},
      default: {},
      setValue: () => {},
    },
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
  children: ReactNode;
};

export default function BoxContextProvider({
  box,
  onBoxUpdate,
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

  const { algorithmKey, problemKey } = useMemo(() => {
    const {
      algorithm: algorithmKey,
      problem: problemKey,
      algorithmVisualizers: visualizerKey,
    } = box ?? {};

    return {
      algorithmKey,
      problemKey,
      visualizerKey,
    };
  }, [box]);

  const problem = useBoxContextProblem({
    options: problemOptions,
    defaultKey: problemKey,
    onKeyChange: (key) => {
      onBoxUpdate?.((box) => ({
        ...box,
        problem: key,
      }));
    },
  });

  const algorithm = useBoxContextAlgorithm({
    options: algorithmOptions,
    defaultKey: algorithmKey,
    onKeyChange: (key) => {
      onBoxUpdate?.((box) => ({
        ...box,
        algorithm: key,
      }));
    },
  });

  const boxVisualizers = box?.visualizers;

  const visualizers = useBoxContextVisualizers({
    options: visualizerOptions,
    defaultAliases: boxVisualizers?.aliases ?? {},
    defaultOrder: boxVisualizers?.order ?? [],
    onAliasesChange: (aliases) => {
      onBoxUpdate?.((box) => ({
        ...box,
        visualizers: {
          order: box.visualizers?.order ?? [],
          aliases,
        },
      }));
    },
    onOrderChange: (order) => {
      onBoxUpdate?.((box) => ({
        ...box,
        visualizers: {
          aliases: box.visualizers?.aliases ?? {},
          order,
        },
      }));
    },
  });

  const problemAlgorithmConfig = useMemo(
    () =>
      box?.problemAlgorithm ??
      ({
        aliases: {},
        composition: { type: 'flat', order: [] },
      } as AdapterConfigurationFlat),
    [box?.problemAlgorithm],
  );

  const problemAlgorithm = useBoxContextProblemAlgorithm({
    algorithm,
    adapterOptions,
    problem,
    adapterConfiguration: problemAlgorithmConfig,
    onAdapterConfigurationChange: (config) => {
      onBoxUpdate?.((box) => ({
        ...box,
        problemAlgorithm: config,
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

  const algorithmVisualizers = useBoxContextAlgorithmVisualizers({
    adapterOptions,
    value: box?.algorithmVisualizers ?? {
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
        algorithmVisualizers: newValue,
      }));
    },
  });

  const boxEnvironment = useMemo(() => {
    const algorithmFiles = algorithm.select.value?.value.files;
    const problemFiles = problem.select.value?.value.files;

    const renameFiles = (
      files: Record<string, string> | undefined,
      newFolderName: string,
    ) => {
      if (files === undefined) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(files ?? {}).map(([filePath, value]) => [
          `${newFolderName}/${filePath.split('/').slice(-1)[0]}`,
          value,
        ]),
      );
    };

    const algorithmFilesRenamed = renameFiles(algorithmFiles, 'algorithm');
    const problemFilesRenamed = renameFiles(problemFiles, 'problem');

    const boxEnvironment = {
      ...algorithmFilesRenamed,
      ...problemFilesRenamed,
    };

    return boxEnvironment;
  }, [algorithm.select.value?.value.files, problem.select.value?.value.files]);

  const setBoxEnvironment = useCallback(
    (boxEnvironment: Record<string, string>) => {
      // Get files matching folder name, then remap keys to remove folder names
      const getFilesInFolder = (folderName: `${string}/`) => {
        return Object.fromEntries(
          Object.entries(boxEnvironment ?? {})
            .filter(([filePath]) => filePath.startsWith(folderName))
            .map(([filePath, value]) => [
              filePath.substring(folderName.length),
              value,
            ]),
        );
      };

      const algorithmFiles = getFilesInFolder('algorithm/');
      const problemFiles = getFilesInFolder('problem/');
      const algorithmOption = algorithm.select.value;
      const problemOption = problem.select.value;

      if (algorithmOption === null) {
        throw new Error('Selected algorithm is null');
      }

      if (problemOption === null) {
        throw new Error('Selected problem is null');
      }

      if (!isEqual(algorithmFiles, algorithmOption.value.files)) {
        const isNew = algorithmOption.type === 'built-in';
        if (isNew) {
          algorithm.custom.add({
            name: getCustomDbObjectName(algorithmOption.value),
            files: algorithmFiles,
            editable: true,
            type: 'algorithm',
          });
        } else {
          algorithm.custom.set({
            ...algorithmOption.value,
            key: algorithm.custom.selected!.key,
            files: algorithmFiles,
          });
        }
      }

      if (!isEqual(problemFiles, problemOption.value.files)) {
        const isNew = problemOption.type === 'built-in';
        if (isNew) {
          problem.custom.add({
            name: getCustomDbObjectName(problemOption.value),
            files: problemFiles,
            editable: true,
            type: 'problem',
          });
        } else {
          problem.custom.set({
            ...problemOption.value,
            key: problem.custom.selected!.key,
            files: problemFiles,
          });
        }
      }
    },
    [
      algorithm.custom,
      algorithm.select.value,
      problem.custom,
      problem.select.value,
    ],
  );

  const openBoxEditor = useCallback(() => {
    addOrFocusTab({
      type: 'box-editor',
      label: `Edit: ${boxName}`,
    });
  }, [addOrFocusTab, boxName]);

  const openFlowchart = useCallback(() => {
    addOrFocusTab({
      type: 'flowchart',
      label: `Visualizers: ${boxName}`,
    });
  }, [addOrFocusTab, boxName]);

  const value = useMemo(() => {
    return {
      problem,
      problemAlgorithm,
      algorithm,
      algorithmVisualizers: algorithmVisualizers,
      boxEnvironment: {
        value: boxEnvironment,
        setValue: setBoxEnvironment,
      },
      openBoxEditor,
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
      visualizers,
    } satisfies BoxContextType;
  }, [
    algorithm,
    algorithmVisualizers,
    box,
    boxEnvironment,
    boxName,
    onBoxReset,
    onBoxUpdate,
    openBoxEditor,
    openFlowchart,
    problem,
    problemAlgorithm,
    setBoxEnvironment,
    visualizers,
  ]);

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}
