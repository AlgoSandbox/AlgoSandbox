import { PlaybackSpeed } from '@components/box-page/BoxControlsContextProvider';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const maxExecutionStepCountKey = 'sandbox:preferences:maxExecutionStepCount';
const flowchartModeKey = 'sandbox:preferences:flowchartMode';
const playbackSpeedKey = 'sandbox:preferences:playbackSpeed';

const defaultMaxExecutionStepCount = 1000;

type FlowchartMode = 'simple' | 'intermediate' | 'full';

type UserPreferences = {
  maxExecutionStepCount: number;
  setMaxExecutionStepCount: (steps: number) => void;
  flowchartMode: FlowchartMode;
  setFlowchartMode: (mode: FlowchartMode) => void;
  playbackSpeed: PlaybackSpeed;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
};

type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

const UserPreferencesContext = createContext<UserPreferences>({
  maxExecutionStepCount: defaultMaxExecutionStepCount,
  setMaxExecutionStepCount: () => {},
  flowchartMode: 'simple',
  setFlowchartMode: () => {},
  playbackSpeed: 1,
  setPlaybackSpeed: () => {},
});

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}

export default function UserPreferencesProvider({
  children,
}: UserPreferencesProviderProps) {
  const [maxExecutionStepCount, setMaxExecutionStepCount] = useState(
    defaultMaxExecutionStepCount,
  );
  const [flowchartMode, setFlowchartMode] = useState<FlowchartMode>('simple');
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  useEffect(() => {
    const cachedMaxExecutionStepCount = localStorage.getItem(
      maxExecutionStepCountKey,
    );
    if (cachedMaxExecutionStepCount === null) {
      return;
    }
    setMaxExecutionStepCount(parseInt(cachedMaxExecutionStepCount, 10));
  }, []);

  useEffect(() => {
    const cachedFlowchartMode = localStorage.getItem(
      'sandbox:preferences:flowchartMode',
    );
    if (cachedFlowchartMode === null) {
      return;
    }
    setFlowchartMode(cachedFlowchartMode as FlowchartMode);
  }, []);

  useEffect(() => {
    const cachedPlaybackSpeed = localStorage.getItem(playbackSpeedKey);
    if (cachedPlaybackSpeed === null) {
      return;
    }
    setPlaybackSpeed(parseFloat(cachedPlaybackSpeed) as PlaybackSpeed);
  }, []);

  const handleMaxExecutionStepCountChange = useCallback((steps: number) => {
    localStorage.setItem(maxExecutionStepCountKey, steps.toString());
    setMaxExecutionStepCount(steps);
  }, []);

  const handleFlowchartModeChange = useCallback((mode: FlowchartMode) => {
    localStorage.setItem(flowchartModeKey, mode);
    setFlowchartMode(mode);
  }, []);

  const handlePlaybackSpeedChange = useCallback((speed: PlaybackSpeed) => {
    localStorage.setItem(playbackSpeedKey, speed.toString());
    setPlaybackSpeed(speed);
  }, []);

  const value = useMemo(() => {
    return {
      maxExecutionStepCount,
      setMaxExecutionStepCount: handleMaxExecutionStepCountChange,
      flowchartMode,
      setFlowchartMode: handleFlowchartModeChange,
      playbackSpeed,
      setPlaybackSpeed: handlePlaybackSpeedChange,
    };
  }, [
    flowchartMode,
    handleFlowchartModeChange,
    handleMaxExecutionStepCountChange,
    handlePlaybackSpeedChange,
    maxExecutionStepCount,
    playbackSpeed,
  ]);

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
