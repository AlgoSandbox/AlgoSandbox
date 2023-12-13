import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const isAdvancedModeEnabledKey = 'sandbox:preferences:isAdvancedModeEnabled';

type UserPreferences = {
  isAdvancedModeEnabled: boolean;
  setAdvancedModeEnabled: (enabled: boolean) => void;
};

type UserPreferencesProviderProps = {
  children: React.ReactNode;
};

const UserPreferencesContext = createContext<UserPreferences>({
  isAdvancedModeEnabled: false,
  setAdvancedModeEnabled: () => {},
});

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}

export default function UserPreferencesProvider({
  children,
}: UserPreferencesProviderProps) {
  const [isAdvancedModeEnabled, setAdvancedModeEnabled] = useState(false);

  useEffect(() => {
    const cachedEnabled = localStorage.getItem(isAdvancedModeEnabledKey);
    if (cachedEnabled === null) {
      return;
    }
    setAdvancedModeEnabled(cachedEnabled === 'true');
  }, []);

  const handleAdvancedModeEnabledChange = useCallback((enabled: boolean) => {
    localStorage.setItem(isAdvancedModeEnabledKey, enabled.toString());
    setAdvancedModeEnabled(enabled);
  }, []);

  const value = useMemo(() => {
    return {
      isAdvancedModeEnabled,
      setAdvancedModeEnabled: handleAdvancedModeEnabledChange,
    };
  }, [handleAdvancedModeEnabledChange, isAdvancedModeEnabled]);

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
