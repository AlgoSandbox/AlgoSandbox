import { SandboxStateType } from '@algo-sandbox/core';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { ReadonlySandboxScene } from '@utils/scene';
import useCancelableInterval from '@utils/useCancelableInterval';
import { createContext, useCallback, useContext, useMemo } from 'react';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.25 | 1.5 | 2;

type BoxControlsContextType = {
  play: () => void;
  restartAndPlay: () => void;
  stop: () => void;
  previous: () => Promise<void>;
  next: () => Promise<boolean>;
  reset: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentStepIndex: number;
  setCurrentStepIndex: (stepIndex: number) => void;
  maxSteps: number | null;
  isPlaying: boolean;
  skipToStart: () => Promise<void>;
  skipToEnd: () => Promise<void>;
  isExecuting: boolean;
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
};

export const BoxControlsContext = createContext<BoxControlsContextType>({
  stop: () => {},
  play: () => {},
  restartAndPlay: () => {},
  next: async () => false,
  reset: () => {},
  skipToStart: async () => {},
  skipToEnd: async () => {},
  hasPrevious: false,
  hasNext: false,
  previous: async () => {},
  currentStepIndex: 0,
  setCurrentStepIndex: () => {},
  maxSteps: null,
  isPlaying: false,
  isExecuting: false,
  playbackSpeed: 1,
  setPlaybackSpeed: () => {},
});

export function useBoxControlsContext() {
  return useContext(BoxControlsContext);
}

export default function BoxControlsContextProvider({
  children,
  scene,
  currentStepIndex,
  onCurrentStepIndexChange,
  onSkipToEnd,
  isExecuting,
  maxSteps,
}: {
  children: React.ReactNode;
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  currentStepIndex: number;
  onCurrentStepIndexChange: (stepIndex: number) => Promise<void>;
  isExecuting: boolean;
  onSkipToEnd: () => Promise<void>;
  maxSteps: number | null;
}) {
  const previous = useCallback(async () => {
    if (currentStepIndex > 0) {
      await onCurrentStepIndexChange(currentStepIndex - 1);
    }
  }, [currentStepIndex, onCurrentStepIndexChange]);

  const next = useCallback(async () => {
    if (scene === null) {
      // Pause
      return false;
    }

    if (maxSteps !== null && currentStepIndex >= maxSteps - 1) {
      // Pause
      return false;
    }

    await onCurrentStepIndexChange(currentStepIndex + 1);

    return true;
  }, [currentStepIndex, maxSteps, onCurrentStepIndexChange, scene]);

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

  const value = useMemo(
    () => ({
      next,
      isPlaying,
      hasNext: hasNextStep,
      hasPrevious: hasPreviousStep,
      currentStepIndex,
      setCurrentStepIndex: onCurrentStepIndexChange,
      play,
      previous,
      restartAndPlay: () => {
        onCurrentStepIndexChange(0);
        play();
      },
      stop,
      reset: () => {
        onCurrentStepIndexChange(0);
      },
      skipToStart: async () => {
        onCurrentStepIndexChange(0);
      },
      skipToEnd: async () => {
        if (scene === null) {
          return;
        }
        await onSkipToEnd();
      },
      maxSteps,
      isExecuting,
      playbackSpeed,
      setPlaybackSpeed,
    }),
    [
      currentStepIndex,
      hasNextStep,
      hasPreviousStep,
      isExecuting,
      isPlaying,
      maxSteps,
      next,
      onCurrentStepIndexChange,
      onSkipToEnd,
      play,
      playbackSpeed,
      previous,
      scene,
      setPlaybackSpeed,
      stop,
    ],
  );

  return (
    <BoxControlsContext.Provider value={value}>
      {children}
    </BoxControlsContext.Provider>
  );
}
