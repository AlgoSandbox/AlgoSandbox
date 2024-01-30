import { SandboxBox } from '@algo-sandbox/core';
import { defaultBoxContextProblem } from '@components/box-page/box-context/sandbox-object/problem';
import { useSavedObjectQuery } from '@utils/db/objects';
import { evalSavedObject } from '@utils/evalSavedObject';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type BoxManagerType = {
  getBox: (key: string) => SandboxBoxNamed | null;
  createNewBox: (box?: SandboxBoxNamed) => string;
  updateBox: (key: string, box: SandboxBoxNamed) => void;
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
  const { data: savedBox } = useSavedObjectQuery<'box'>(key);
  const box: SandboxBoxNamed | null = useMemo(() => {
    const localBox = getBox(key);
    if (localBox !== null) {
      return localBox;
    }

    const { objectEvaled: evaledBox, errorMessage } = evalSavedObject<'box'>(
      savedBox ?? null,
    );

    if (savedBox === null || savedBox === undefined) {
      return null;
    }

    if (errorMessage != null) {
      return null;
    }

    if (evaledBox === null) {
      return null;
    }

    return { ...evaledBox, name: savedBox.name };
  }, [getBox, savedBox, key]);
  return box;
}

const defaultBox: SandboxBoxNamed = {
  name: 'Untitled box',
  algorithm: 'algorithm.search.bfs',
  problem: 'problem.graphs.fiveNodes',
  visualizer: 'visualizer.graphs.searchGraph',
};

export type SandboxBoxNamed = SandboxBox & {
  name: string;
};

export default function BoxManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  defaultBoxContextProblem;
  const [boxes, setBoxes] = useState<Record<string, SandboxBoxNamed>>({});

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

  const updateBox = useCallback((key: string, box: SandboxBoxNamed) => {
    setBoxes((boxes) => ({ ...boxes, [key]: box }));
  }, []);

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
