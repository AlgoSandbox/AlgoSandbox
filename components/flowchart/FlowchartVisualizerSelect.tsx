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
  const setAlgorithmVisualizers = useBoxContext('algorithmVisualizers.set');
  const algorithmVisualizersTree = useBoxContext('algorithmVisualizers.tree');

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
      setAlgorithmVisualizers({
        adapters: algorithmVisualizersTree.adapters,
        composition: {
          ...algorithmVisualizersTree.composition,
          connections: algorithmVisualizersTree.composition.connections.filter(
            ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
          ),
        },
      });
    },
    parameters: parameters ?? null,
    onParametersChange: (parameters) => {
      setAlias(alias, {
        key: visualizerKey,
        parameters,
      });
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
        setAlias(alias, {
          key: visualizerKey,
          parameters: params,
        });
      }}
      parameters={parameters ?? null}
    />
  );
}
