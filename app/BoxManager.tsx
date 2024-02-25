import { SandboxBox } from '@algo-sandbox/core';
import { defaultBoxContextProblem } from '@components/box-page/box-context/sandbox-object/problem';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { evalSavedObject } from '@utils/evalSavedObject';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { error, ErrorOr, success } from './errors/ErrorContext';

type BoxManagerType = {
  getBox: (key: string) => SandboxBoxNamed | null;
  createNewBox: (box?: SandboxBoxNamed) => string;
  updateBox: (
    key: string,
    update: (oldBox: SandboxBoxNamed) => SandboxBoxNamed,
  ) => void;
};

const BoxManagerContext = createContext<BoxManagerType>({
  getBox: () => {
    return null;
  },
  createNewBox: () => {
    throw new Error('BoxManagerContext not initialized');
  },
  updateBox: () => {},
});

export function useBoxManager() {
  return useContext(BoxManagerContext);
}

export function useBox(key: string) {
  const { getBox } = useContext(BoxManagerContext);
  const { boxOptions } = useSandboxComponents();

  const allBoxes = useMemo(() => {
    return boxOptions.flatMap((box) => box.options);
  }, [boxOptions]);

  const box: ErrorOr<SandboxBoxNamed> = useMemo(() => {
    const localBox = getBox(key);
    if (localBox !== null) {
      return success(localBox);
    }

    const savedBox = allBoxes.find((box) => box.key === key)?.value;

    if (savedBox === undefined) {
      return error(`Unable to find box with key: ${key}`);
    }

    const evaledBox = evalSavedObject<'box'>(savedBox);

    return evaledBox.map((b) => ({ ...b, name: savedBox.name }));
  }, [allBoxes, getBox, key]);
  return box;
}

const defaultBox: SandboxBoxNamed = {
  name: 'Untitled box',
  algorithm: 'algorithm.search.bfs',
  problem: 'problem.graphs.fiveNodes',
  visualizers: {
    aliases: {
      'visualizer-0': 'visualizer.graphs.searchGraph',
    },
    order: ['visualizer-0'],
  },
};

export type SandboxBoxNamed = SandboxBox & {
  name: string;
};

export default function BoxManagerProvider({
  children,
  defaultBoxes,
}: {
  children: React.ReactNode;
  defaultBoxes?: Record<string, SandboxBoxNamed>;
}) {
  defaultBoxContextProblem;
  const [boxes, setBoxes] = useState<Record<string, SandboxBoxNamed>>(
    defaultBoxes ?? {},
  );

  useEffect(() => {
    if (defaultBoxes === undefined) {
      return;
    }
    setBoxes(defaultBoxes);
  }, [defaultBoxes]);

  const getBox = useCallback(
    (key: string) => {
      return boxes[key] ?? null;
    },
    [boxes],
  );

  const createNewBox = useCallback(
    (box?: SandboxBoxNamed) => {
      const getNewBoxKey = () => {
        return `box-${Object.keys(boxes).length + 1}`;
      };
      const key = getNewBoxKey();
      setBoxes({ ...boxes, [key]: { ...(box ?? defaultBox) } });
      return key;
    },
    [boxes],
  );

  const updateBox = useCallback(
    (key: string, update: (oldBox: SandboxBoxNamed) => SandboxBoxNamed) => {
      setBoxes((boxes) => {
        return { ...boxes, [key]: update(boxes[key]) };
      });
    },
    [],
  );

  const value = useMemo(
    () =>
      ({
        getBox,
        createNewBox,
        updateBox,
      }) satisfies BoxManagerType,
    [getBox, createNewBox, updateBox],
  );

  return (
    <BoxManagerContext.Provider value={value}>
      {children}
    </BoxManagerContext.Provider>
  );
}
