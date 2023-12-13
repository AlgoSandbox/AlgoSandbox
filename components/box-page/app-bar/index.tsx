import AppLogo from '@components/AppLogo';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Button } from '@components/ui';
import Toggle from '@components/ui/Toggle';

import { useBoxContext } from '..';
import AlgorithmSelect from './AlgorithmSelect';
import AlgorithmVisualizerAdapterSelect from './AlgorithmVisualizerAdapterSelect';
import AlgorithmVisualizerFlowChartPopover from './AlgorithmVisualizerFlowChartPopover';
import ProblemAlgorithmAdapterSelect from './ProblemAlgorithmAdapterSelect';
import ProblemSelect from './ProblemSelect';
import VisualizerSelect from './VisualizerSelect';

export default function AppBar() {
  const { setValue: setMode } = useBoxContext('mode');
  const { isAdvancedModeEnabled, setAdvancedModeEnabled } =
    useUserPreferences();

  return (
    <header className="flex justify-between items-center px-4 border-b py-2 border-slate-300 gap-8">
      <div className="flex gap-8 items-center">
        {!isAdvancedModeEnabled && <AppLogo />}
        <div className="flex flex-row items-end gap-2">
          <ProblemSelect />
          <ProblemAlgorithmAdapterSelect />
          <AlgorithmSelect />
          <AlgorithmVisualizerAdapterSelect />
          <VisualizerSelect />
          <AlgorithmVisualizerFlowChartPopover />
          {isAdvancedModeEnabled && (
            <Button
              label="Customize in editor mode"
              variant="primary"
              onClick={() => {
                setMode('editor');
              }}
            />
          )}
        </div>
      </div>
      <Toggle
        label="Advanced mode"
        value={isAdvancedModeEnabled}
        onChange={setAdvancedModeEnabled}
      />
    </header>
  );
}
