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

const defaultMaxExecutionStepCount = 1000;

type FlowchartMode = 'simple' | 'full';

type UserPreferences = {
  maxExecutionStepCount: number;
  setMaxExecutionStepCount: (steps: number) => void;
  flowchartMode: FlowchartMode;
  setFlowchartMode: (mode: FlowchartMode) => void;
};

type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

const UserPreferencesContext = createContext<UserPreferences>({
  maxExecutionStepCount: defaultMaxExecutionStepCount,
  setMaxExecutionStepCount: () => {},
  flowchartMode: 'simple',
  setFlowchartMode: () => {},
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

  const handleMaxExecutionStepCountChange = useCallback((steps: number) => {
    localStorage.setItem(maxExecutionStepCountKey, steps.toString());
    setMaxExecutionStepCount(steps);
  }, []);

  const handleFlowchartModeChange = useCallback((mode: FlowchartMode) => {
    localStorage.setItem(flowchartModeKey, mode);
    setFlowchartMode(mode);
  }, []);

  const value = useMemo(() => {
    return {
      maxExecutionStepCount,
      setMaxExecutionStepCount: handleMaxExecutionStepCountChange,
      flowchartMode,
      setFlowchartMode: handleFlowchartModeChange,
    };
  }, [
    flowchartMode,
    handleFlowchartModeChange,
    handleMaxExecutionStepCountChange,
    maxExecutionStepCount,
  ]);

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
