import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const isAdvancedModeEnabledKey = 'sandbox:preferences:isAdvancedModeEnabled';
const isBoxComponentsShownKey = 'sandbox:preferences:isBoxComponentsShown';
const maxExecutionStepCountKey = 'sandbox:preferences:maxExecutionStepCount';

const defaultMaxExecutionStepCount = 1000;

type UserPreferences = {
  isAdvancedModeEnabled: boolean;
  setAdvancedModeEnabled: (enabled: boolean) => void;
  isBoxComponentsShown: boolean;
  setBoxComponentsShown: (shown: boolean) => void;
  maxExecutionStepCount: number;
  setMaxExecutionStepCount: (steps: number) => void;
};

type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

const UserPreferencesContext = createContext<UserPreferences>({
  isAdvancedModeEnabled: false,
  setAdvancedModeEnabled: () => {},
  isBoxComponentsShown: true,
  setBoxComponentsShown: () => {},
  maxExecutionStepCount: defaultMaxExecutionStepCount,
  setMaxExecutionStepCount: () => {},
});

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}

export default function UserPreferencesProvider({
  children,
}: UserPreferencesProviderProps) {
  const [isAdvancedModeEnabled, setAdvancedModeEnabled] = useState(false);
  const [isBoxComponentsShown, setBoxComponentsShown] = useState(true);
  const [maxExecutionStepCount, setMaxExecutionStepCount] = useState(
    defaultMaxExecutionStepCount,
  );

  useEffect(() => {
    const cachedEnabled = localStorage.getItem(isAdvancedModeEnabledKey);
    if (cachedEnabled === null) {
      return;
    }
    setAdvancedModeEnabled(cachedEnabled === 'true');
  }, []);

  useEffect(() => {
    const cachedShown = localStorage.getItem(isBoxComponentsShownKey);
    if (cachedShown === null) {
      return;
    }
    setBoxComponentsShown(cachedShown === 'true');
  }, []);

  useEffect(() => {
    const cachedMaxExecutionStepCount = localStorage.getItem(
      maxExecutionStepCountKey,
    );
    if (cachedMaxExecutionStepCount === null) {
      return;
    }
    setMaxExecutionStepCount(parseInt(cachedMaxExecutionStepCount, 10));
  }, []);

  const handleAdvancedModeEnabledChange = useCallback((enabled: boolean) => {
    localStorage.setItem(isAdvancedModeEnabledKey, enabled.toString());
    setAdvancedModeEnabled(enabled);
  }, []);

  const handleBoxComponentsShownChange = useCallback((shown: boolean) => {
    localStorage.setItem(isBoxComponentsShownKey, shown.toString());
    setBoxComponentsShown(shown);
  }, []);

  const handleMaxExecutionStepCountChange = useCallback((steps: number) => {
    localStorage.setItem(maxExecutionStepCountKey, steps.toString());
    setMaxExecutionStepCount(steps);
  }, []);

  const value = useMemo(() => {
    return {
      isAdvancedModeEnabled,
      setAdvancedModeEnabled: handleAdvancedModeEnabledChange,
      isBoxComponentsShown,
      setBoxComponentsShown: handleBoxComponentsShownChange,
      maxExecutionStepCount,
      setMaxExecutionStepCount: handleMaxExecutionStepCountChange,
    };
  }, [
    handleAdvancedModeEnabledChange,
    handleBoxComponentsShownChange,
    handleMaxExecutionStepCountChange,
    isAdvancedModeEnabled,
    isBoxComponentsShown,
    maxExecutionStepCount,
  ]);

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
