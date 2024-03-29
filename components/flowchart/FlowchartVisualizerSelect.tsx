import { useBoxContext } from '@components/box-page';
import ComponentSelect from '@components/box-page/app-bar/ComponentSelect';
import { useBoxContextSandboxObject } from '@components/box-page/box-context/sandbox-object';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { useMemo } from 'react';

export default function FlowchartVisualizerSelect({
  alias,
  className,
}: {
  alias: string;
  className?: string;
}) {
  const { visualizerOptions } = useSandboxComponents();
  const aliases = useBoxContext('visualizers.aliases');
  const setAlias = useBoxContext('visualizers.setAlias');
  const setConfig = useBoxContext('config.set');
  const configTree = useBoxContext('config.tree');

  const { key: visualizerKey, parameters } = parseKeyWithParameters(
    aliases[alias],
  );

  const visualizerObject = useBoxContextSandboxObject({
    type: 'visualizer',
    options: visualizerOptions,
    addSavedObjectMutation: useAddSavedVisualizerMutation(),
    setSavedObjectMutation: useSetSavedVisualizerMutation(),
    removeSavedObjectMutation: useRemoveSavedVisualizerMutation(),
    savedObjects: useSavedVisualizersQuery().data,
    key: visualizerKey,
    onKeyChange: (key) => {
      if (key === null) {
        return;
      }

      setAlias(alias, key);
      setConfig({
        adapters: configTree.adapters,
        composition: {
          ...configTree.composition,
          connections: configTree.composition.connections.filter(
            ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
          ),
        },
      });
    },
    parameters: parameters ?? null,
    onParametersChange: (parameters) => {
      setAlias(
        alias,
        parameters
          ? {
              key: visualizerKey,
              parameters,
            }
          : visualizerKey,
      );
    },
  });

  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = visualizerObject.select;

  const visualizerEvaluation = visualizerObject.value;

  const defaultAll = useBoxContext('visualizers.defaultParameters');

  const defaultParameters = useMemo(
    () => defaultAll[alias] ?? {},
    [alias, defaultAll],
  );

  return (
    <ComponentSelect<'visualizer'>
      className={className}
      label="Problem"
      hideLabel={true}
      hideErrors={true}
      value={selectedOption}
      onChange={setSelectedOption}
      options={options}
      evaluatedValue={visualizerEvaluation}
      defaultParameters={defaultParameters}
      setParameters={(params) => {
        setAlias(
          alias,
          params
            ? {
                key: visualizerKey,
                parameters: params,
              }
            : visualizerKey,
        );
      }}
      parameters={parameters ?? null}
    />
  );
}
