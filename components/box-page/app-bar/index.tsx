import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { Button, MaterialSymbol } from '@components/ui';

import { useBoxContext } from '..';
import AlgorithmSelect from './AlgorithmSelect';
import ProblemAlgorithmAdapterSelect from './ProblemAlgorithmAdapterSelect';
import ProblemSelect from './ProblemSelect';

export default function AppBar() {
  const { setBoxComponentsShown } = useUserPreferences();
  const { openFlowchart } = useBoxContext();

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
      <Button
        label="Hide box components"
        hideLabel={true}
        variant="primary"
        onClick={() => {
          setBoxComponentsShown(false);
        }}
        icon={<MaterialSymbol icon="unfold_less" />}
      />
    </header>
  );
}
