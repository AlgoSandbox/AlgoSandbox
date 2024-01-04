import AppLogo from '@components/AppLogo';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Button, MaterialSymbol, Select } from '@components/ui';
import Toggle from '@components/ui/Toggle';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import { useBoxContext } from '..';
import AlgorithmSelect from './AlgorithmSelect';
import AlgorithmVisualizerAdapterSelect from './AlgorithmVisualizerAdapterSelect';
import ProblemAlgorithmAdapterSelect from './ProblemAlgorithmAdapterSelect';
import ProblemSelect from './ProblemSelect';
import VisualizerSelect from './VisualizerSelect';

const themeOptions = [
  { label: 'System', key: 'system', value: 'system' },
  { label: 'Light', key: 'light', value: 'light' },
  { label: 'Dark', key: 'dark', value: 'dark' },
];

export default function AppBar() {
  const openBoxEditor = useBoxContext('openBoxEditor');
  const openFlowchart = useBoxContext('openFlowchart');
  const { theme, setTheme } = useTheme();
  const selectedThemeOption = useMemo(() => {
    return themeOptions.find((option) => option.value === theme);
  }, [theme]);
  const { isAdvancedModeEnabled, setAdvancedModeEnabled } =
    useUserPreferences();

  return (
    <header className="flex justify-between items-center px-4 border-b py-2 gap-8 bg-surface">
      <div className="flex gap-8 items-center">
        {!isAdvancedModeEnabled && <AppLogo />}
        <div className="flex flex-row items-end gap-2">
          <ProblemSelect />
          <ProblemAlgorithmAdapterSelect />
          <AlgorithmSelect />
          <AlgorithmVisualizerAdapterSelect />
          <Button
            hideLabel
            icon={<MaterialSymbol icon="schema" />}
            label="Compose adapters"
            onClick={openFlowchart}
          />
          <VisualizerSelect />
          {isAdvancedModeEnabled && (
            <Button
              label="Edit box code"
              variant="primary"
              onClick={openBoxEditor}
              icon={<MaterialSymbol icon="open_in_new" />}
            />
          )}
        </div>
      </div>
      <div className="flex gap-4 items-end">
        <Toggle
          className="mb-2"
          label="Advanced mode"
          value={isAdvancedModeEnabled}
          onChange={setAdvancedModeEnabled}
        />
        <Select
          options={themeOptions}
          value={selectedThemeOption}
          onChange={(option) => {
            setTheme(option.value);
          }}
          label="Theme"
        />
      </div>
    </header>
  );
}
