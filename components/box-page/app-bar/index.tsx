import { Button, MaterialSymbol, Popover } from '@components/ui';
import Checkbox from '@components/ui/Checkbox';

import { useBoxContext } from '..';
import AlgorithmSelect from './AlgorithmSelect';
import ProblemAlgorithmAdapterSelect from './ProblemAlgorithmAdapterSelect';
import ProblemSelect from './ProblemSelect';

export default function AppBar({
  allVisualizerOrder,
  hiddenVisualizerAliases,
  onHiddenVisualizerAliasesChange,
}: {
  allVisualizerOrder: Array<string>;
  hiddenVisualizerAliases: Set<string>;
  onHiddenVisualizerAliasesChange: (
    hiddenVisualizerAliases: Set<string>,
  ) => void;
}) {
  const { openFlowchart } = useBoxContext();
  const visualizerInstances = useBoxContext('visualizers.instances');

  const getVisualizerName = (alias: string) => {
    const visualizer = visualizerInstances[alias];
    if (visualizer === undefined) {
      return alias;
    }
    return `${visualizer.name} (${alias})`;
  };

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
      <div className="flex gap-4">
        <Popover
          content={
            <div className="bg-surface-high p-4">
              <span className="text-md font-semibold mb-1 block">
                Show only:
              </span>
              <ul className="flex flex-col gap-2">
                {allVisualizerOrder.map((alias) => (
                  <li key={alias}>
                    <Checkbox
                      onChange={(checked) => {
                        if (checked) {
                          const newHiddenVisualizerAliases = new Set(
                            hiddenVisualizerAliases,
                          );
                          newHiddenVisualizerAliases.delete(alias);
                          onHiddenVisualizerAliasesChange(
                            newHiddenVisualizerAliases,
                          );
                        } else {
                          onHiddenVisualizerAliasesChange(
                            new Set(hiddenVisualizerAliases).add(alias),
                          );
                        }
                      }}
                      label={getVisualizerName(alias)}
                      checked={!hiddenVisualizerAliases.has(alias)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <Button
            label="Customize view"
            variant="filled"
            icon={<MaterialSymbol icon="dashboard_customize" />}
          />
        </Popover>
      </div>
    </header>
  );
}
