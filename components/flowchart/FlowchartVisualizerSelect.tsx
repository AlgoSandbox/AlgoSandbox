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

  const visualizerKey = aliases[alias];

  const visualizerObject = useBoxContextSandboxObject({
    type: 'visualizer',
    options: visualizerOptions,
    addSavedObjectMutation: useAddSavedVisualizerMutation(),
    setSavedObjectMutation: useSetSavedVisualizerMutation(),
    removeSavedObjectMutation: useRemoveSavedVisualizerMutation(),
    savedObjects: useSavedVisualizersQuery().data,
    defaultKey: visualizerKey,
    onSelect: ({ key }) => {
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
  });

  const {
    value: selectedOption,
    setValue: setSelectedOption,
    options,
  } = visualizerObject.select;

  const visualizerEvaluation = visualizerObject.value;

  const {
    default: defaultAll,
    setValue: setParameters,
    value: parametersAll,
  } = useBoxContext('visualizers.parameters');

  const defaultParameters = useMemo(
    () => defaultAll[alias] ?? {},
    [alias, defaultAll],
  );

  const parameters = useMemo(
    () => parametersAll[alias] ?? {},
    [alias, parametersAll],
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
        setParameters(alias, params);
      }}
      parameters={parameters}
    />
  );
}
