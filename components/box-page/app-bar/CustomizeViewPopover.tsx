import { Button, MaterialSymbol, Popover } from '@components/ui';
import Checkbox from '@components/ui/Checkbox';
import { useMemo } from 'react';

import { useBoxContext } from '..';

export default function CustomizeViewPopover() {
  const visualizerInstances = useBoxContext('visualizers.instances');
  const componentNames = useBoxContext('componentNames');
  const getVisualizerName = (alias: string) => {
    const componentName = componentNames[alias];
    if (componentName) {
      return componentName;
    }

    const visualizer = visualizerInstances[alias];

    return (
      visualizer
        ?.map(({ value }) => `${value.name} (${alias})`)
        .unwrapOr(alias) ?? alias
    );
  };

  const visualizerOrder = useBoxContext('visualizers.order');

  const allVisualizerOrder = useMemo(() => {
    return ['pseudocode', ...visualizerOrder];
  }, [visualizerOrder]);

  const { hiddenVisualizerAliases, setHiddenVisualizerAliases } =
    useBoxContext();

  return (
    <Popover
      content={
        <div className="p-4">
          <span className="text-md font-semibold mb-1 block">Show only:</span>
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
                      setHiddenVisualizerAliases(newHiddenVisualizerAliases);
                    } else {
                      setHiddenVisualizerAliases(
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
        label="Show/hide windows"
        variant="filled"
        hideLabel
        icon={<MaterialSymbol icon="select_window" />}
      />
    </Popover>
  );
}
