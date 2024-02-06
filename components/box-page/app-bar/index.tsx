import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Button, MaterialSymbol } from '@components/ui';

import { useBoxContext } from '..';
import AlgorithmSelect from './AlgorithmSelect';
import ProblemAlgorithmAdapterSelect from './ProblemAlgorithmAdapterSelect';
import ProblemSelect from './ProblemSelect';

export default function AppBar() {
  const { isDraft, reset, openBoxEditor, openFlowchart } = useBoxContext();
  const { isAdvancedModeEnabled } = useUserPreferences();

  return (
    <header className="flex justify-between items-center px-4 border-b py-2 gap-8 bg-surface">
      <div className="flex flex-row items-end gap-2">
        <ProblemSelect />
        <ProblemAlgorithmAdapterSelect />
        <AlgorithmSelect />
        <Button
          icon={<MaterialSymbol icon="schema" />}
          label="Visualizations"
          onClick={openFlowchart}
          variant="primary"
        />
      </div>
      <div className="flex gap-2">
        {!isDraft && (
          <Button
            label="Reset box"
            variant="filled"
            onClick={reset}
            icon={<MaterialSymbol icon="settings_backup_restore" />}
          />
        )}
        {isAdvancedModeEnabled && !isDraft && (
          <Button
            label="Edit box"
            variant="primary"
            onClick={openBoxEditor}
            icon={<MaterialSymbol icon="open_in_new" />}
          />
        )}
      </div>
    </header>
  );
}
