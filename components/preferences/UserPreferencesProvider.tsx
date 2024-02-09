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

type UserPreferences = {
  isAdvancedModeEnabled: boolean;
  setAdvancedModeEnabled: (enabled: boolean) => void;
  isBoxComponentsShown: boolean;
  setBoxComponentsShown: (shown: boolean) => void;
};

type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

const UserPreferencesContext = createContext<UserPreferences>({
  isAdvancedModeEnabled: false,
  setAdvancedModeEnabled: () => {},
  isBoxComponentsShown: true,
  setBoxComponentsShown: () => {},
});

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}

export default function UserPreferencesProvider({
  children,
}: UserPreferencesProviderProps) {
  const [isAdvancedModeEnabled, setAdvancedModeEnabled] = useState(false);
  const [isBoxComponentsShown, setBoxComponentsShown] = useState(true);

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

  const handleAdvancedModeEnabledChange = useCallback((enabled: boolean) => {
    localStorage.setItem(isAdvancedModeEnabledKey, enabled.toString());
    setAdvancedModeEnabled(enabled);
  }, []);

  const handleBoxComponentsShownChange = useCallback((shown: boolean) => {
    localStorage.setItem(isBoxComponentsShownKey, shown.toString());
    setBoxComponentsShown(shown);
  }, []);

  const value = useMemo(() => {
    return {
      isAdvancedModeEnabled,
      setAdvancedModeEnabled: handleAdvancedModeEnabledChange,
      isBoxComponentsShown,
      setBoxComponentsShown: handleBoxComponentsShownChange,
    };
  }, [
    handleAdvancedModeEnabledChange,
    handleBoxComponentsShownChange,
    isAdvancedModeEnabled,
    isBoxComponentsShown,
  ]);

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
