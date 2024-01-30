import { useBox, useBoxManager } from '@app/BoxManager';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import getCustomDbObjectName from '@utils/getCustomDbObjectName';
import { Get, RecursivePath } from '@utils/RecursivePath';
import _, { isEqual } from 'lodash';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

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
  algorithmVisualizer: defaultBoxContextAlgorithmVisualizer,
  visualizer: defaultBoxContextVisualizer,
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
  boxKey: string;
  children: ReactNode;
};

export default function BoxContextProvider({
  boxKey,
  children,
}: BoxContextProviderProps) {
  const { addOrFocusTab } = useTabManager();
  const builtInComponents = useBuiltInComponents();
  const {
    builtInAdapterOptions,
    builtInAlgorithmOptions,
    builtInProblemOptions,
    builtInVisualizerOptions,
  } = builtInComponents;

  const box = useBox(boxKey);
  const boxName = box?.name ?? 'Untitled box';
  const { updateBox } = useBoxManager();

  const { algorithmKey, problemKey, visualizerKey } = useMemo(() => {
    const {
      algorithm: algorithmKey,
      problem: problemKey,
      visualizer: visualizerKey,
    } = box ?? {};

    return {
      algorithmKey,
      problemKey,
      visualizerKey,
    };
  }, [box]);

  const problem = useBoxContextProblem({
    builtInProblemOptions,
    defaultKey: problemKey,
    onKeyChange: (key) => {
      if (box !== null) {
        updateBox(boxKey, {
          ...box,
          problem: key,
        });
      }
    },
  });
  const algorithm = useBoxContextAlgorithm({
    builtInAlgorithmOptions,
    defaultKey: algorithmKey,
    onKeyChange: (key) => {
      if (box !== null) {
        updateBox(boxKey, {
          ...box,
          algorithm: key,
        });
      }
    },
  });
  const visualizer = useBoxContextVisualizer({
    builtInVisualizerOptions,
    defaultKey: visualizerKey,
    onKeyChange: (key) => {
      if (box !== null) {
        updateBox(boxKey, {
          ...box,
          visualizer: key,
        });
      }
    },
  });
  const problemAlgorithm = useBoxContextProblemAlgorithm({
    algorithm,
    builtInAdapterOptions,
    problem,
  });
  const algorithmVisualizer = useBoxContextAlgorithmVisualizer({
    algorithm,
    builtInAdapterOptions,
    visualizer,
  });

  const boxEnvironment = useMemo(() => {
    const algorithmFiles = algorithm.select.value?.value.files;
    const problemFiles = problem.select.value?.value.files;
    const visualizerFiles = visualizer.select.value?.value?.files;

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
    const visualizerFilesRenamed = renameFiles(visualizerFiles, 'visualizer');

    const boxEnvironment = {
      ...algorithmFilesRenamed,
      ...problemFilesRenamed,
      ...visualizerFilesRenamed,
    };

    return boxEnvironment;
  }, [
    algorithm.select.value?.value.files,
    problem.select.value?.value.files,
    visualizer.select.value?.value?.files,
  ]);

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
      const visualizerFiles = getFilesInFolder('visualizer/');
      const algorithmOption = algorithm.select.value;
      const problemOption = problem.select.value;
      const visualizerOption = visualizer.select.value;

      if (algorithmOption === null) {
        throw new Error('Selected algorithm is null');
      }

      if (problemOption === null) {
        throw new Error('Selected problem is null');
      }

      if (visualizerOption === null) {
        throw new Error('Selected visualizer is null');
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

      if (!isEqual(visualizerFiles, visualizerOption.value.files)) {
        const isNew = visualizerOption.type === 'built-in';
        if (isNew) {
          visualizer.custom.add({
            name: getCustomDbObjectName(visualizerOption.value),
            files: visualizerFiles,
            editable: true,
            type: 'visualizer',
          });
        } else {
          visualizer.custom.set({
            ...visualizerOption.value,
            key: visualizer.custom.selected!.key,
            files: visualizerFiles,
          });
        }
      }
    },
    [
      algorithm.custom,
      algorithm.select.value,
      problem.custom,
      problem.select.value,
      visualizer.custom,
      visualizer.select.value,
    ],
  );

  const openBoxEditor = useCallback(() => {
    addOrFocusTab({
      type: 'box-editor',
      label: `Edit: ${boxName}`,
      data: {
        boxKey,
      },
    });
  }, [addOrFocusTab, boxKey, boxName]);

  const openFlowchart = useCallback(() => {
    addOrFocusTab({
      type: 'flowchart',
      label: `Adapters: ${boxName}`,
      data: {
        boxKey,
      },
    });
  }, [addOrFocusTab, boxKey, boxName]);

  const value = useMemo(() => {
    return {
      problem,
      problemAlgorithm,
      algorithm,
      algorithmVisualizer,
      visualizer,
      boxEnvironment: {
        value: boxEnvironment,
        setValue: setBoxEnvironment,
      },
      openBoxEditor,
      openFlowchart,
      boxName: {
        value: boxName,
        setValue: (newName) => {
          if (box === null) {
            return;
          }
          updateBox(boxKey, { ...box, name: newName });
        },
      },
      isDraft: box === undefined,
      reset: () => {
        problem.select.reset();
        algorithm.select.reset();
        visualizer.select.reset();
      },
    } satisfies BoxContextType;
  }, [
    algorithm,
    algorithmVisualizer,
    box,
    boxEnvironment,
    boxKey,
    boxName,
    openBoxEditor,
    openFlowchart,
    problem,
    problemAlgorithm,
    setBoxEnvironment,
    updateBox,
    visualizer,
  ]);

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}
