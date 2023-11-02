import { SandboxStateName } from '@algo-sandbox/core';
import { SandboxScene } from '@utils';
import useCancelableInterval from '@utils/useCancelableInterval';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type BoxControlsContextType = {
  play: () => void;
  restartAndPlay: () => void;
  stop: () => void;
  previous: () => void;
  next: () => boolean;
  reset: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentStepIndex: number;
  setCurrentStepIndex: (stepIndex: number) => void;
  maxSteps: number | null;
  isPlaying: boolean;
  skipToStart: () => void;
  skipToEnd: () => void;
};

export const BoxControlsContext = createContext<BoxControlsContextType>({
  stop: () => {},
  play: () => {},
  restartAndPlay: () => {},
  next: () => false,
  reset: () => {},
  skipToStart: () => {},
  skipToEnd: () => {},
  hasPrevious: false,
  hasNext: false,
  previous: () => {},
  currentStepIndex: 0,
  setCurrentStepIndex: () => {},
  maxSteps: null,
  isPlaying: false,
});

export function useBoxControlsContext() {
  return useContext(BoxControlsContext);
}

export default function BoxControlsContextProvider({
  children,
  scene,
  onSceneChange,
  maxSteps,
}: {
  children: React.ReactNode;
  scene: SandboxScene<SandboxStateName, SandboxStateName> | null;
  onSceneChange: (
    scene: SandboxScene<SandboxStateName, SandboxStateName>
  ) => void;
  maxSteps: number | null;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (scene !== null && currentStepIndex > scene.executionTrace.length - 1) {
      setCurrentStepIndex(scene.executionTrace.length - 1);
    }
  }, [currentStepIndex, scene]);

  const previous = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const next = useCallback(() => {
    if (scene === null) {
      // Pause
      return false;
    }

    if (maxSteps !== null && currentStepIndex >= maxSteps - 1) {
      // Pause
      return false;
    }

    const newScene = scene.copyWithExecution(currentStepIndex + 2);
    onSceneChange(newScene);
    if (currentStepIndex + 1 < newScene.executionTrace.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
    // Continue playing
    return true;
  }, [currentStepIndex, maxSteps, onSceneChange, scene]);

  const {
    start: play,
    stop,
    isRunning: isPlaying,
  } = useCancelableInterval(next, 500);

  const hasPreviousStep = currentStepIndex > 0;
  const hasNextStep = maxSteps === null || currentStepIndex < maxSteps - 1;

  return (
    <BoxControlsContext.Provider
      value={{
        next,
        isPlaying,
        hasNext: hasNextStep,
        hasPrevious: hasPreviousStep,
        currentStepIndex,
        setCurrentStepIndex,
        play,
        previous,
        restartAndPlay: () => {
          setCurrentStepIndex(0);
          play();
        },
        stop,
        reset: () => {
          setCurrentStepIndex(0);
        },
        skipToStart: () => {
          setCurrentStepIndex(0);
        },
        skipToEnd: () => {
          if (scene === null) {
            return;
          }
          const fullyExecutedScene = scene.copyWithExecution();
          onSceneChange(fullyExecutedScene);
          setCurrentStepIndex(fullyExecutedScene.executionTrace.length - 1);
        },
        maxSteps,
      }}
    >
      {children}
    </BoxControlsContext.Provider>
  );
}
