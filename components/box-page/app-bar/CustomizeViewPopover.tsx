import { Button, MaterialSymbol, Popover } from '@components/ui';
import Checkbox from '@components/ui/Checkbox';
import { useMemo, useState } from 'react';

import { useBoxContext } from '..';

export default function CustomizeViewPopover() {
  const visualizerInstances = useBoxContext('visualizers.instances');
  const getVisualizerName = (alias: string) => {
    return (
      visualizerInstances[alias]
        ?.map(({ value: visualizer }) => `${visualizer.name} (${alias})`)
        .unwrapOr(alias) ?? alias
    );
  };

  const visualizerOrder = useBoxContext('visualizers.order');

  const allVisualizerOrder = useMemo(() => {
    return ['pseudocode', ...visualizerOrder];
  }, [visualizerOrder]);

  const [hiddenVisualizerAliases, setHiddenVisualizerAliases] = useState<
    Set<string>
  >(new Set());

  return (
    <Popover
      content={
        <div className="bg-surface-high p-4">
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
        label="Customize view"
        variant="filled"
        hideLabel
        icon={<MaterialSymbol icon="dashboard_customize" />}
      />
    </Popover>
  );
}
