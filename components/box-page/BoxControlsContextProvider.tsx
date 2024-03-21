import { SandboxStateType } from '@algo-sandbox/core';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { SandboxScene } from '@utils';
import useCancelableInterval from '@utils/useCancelableInterval';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.25 | 1.5 | 2;

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
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
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
  playbackSpeed: 1,
  setPlaybackSpeed: () => {},
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
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
  onSceneChange: (
    scene: SandboxScene<SandboxStateType, SandboxStateType>,
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

  const { playbackSpeed, setPlaybackSpeed } = useUserPreferences();

  const stepDelay = useMemo(() => {
    return 500 / playbackSpeed;
  }, [playbackSpeed]);

  const {
    start: play,
    stop,
    isRunning: isPlaying,
  } = useCancelableInterval(next, stepDelay);

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
        playbackSpeed,
        setPlaybackSpeed,
      }}
    >
      {children}
    </BoxControlsContext.Provider>
  );
}
