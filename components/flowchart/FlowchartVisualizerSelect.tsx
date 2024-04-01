import { useBoxContext } from '@components/box-page';
import {
  Instance,
  useBoxContextSandboxObject,
} from '@components/box-page/box-context/sandbox-object';
import FlowchartComponentSelect from '@components/flowchart/FlowchartComponentSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { errorFlowchartIncompatibleComponent } from '@constants/flowchart';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { isEqual } from 'lodash';
import { useCallback, useMemo } from 'react';

import { useFilteredObjectOptions } from './useFilteredObjectOptions';

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
    onChange: (key, parameters) => {
      if (key === null) {
        return;
      }

      setAlias(
        alias,
        parameters
          ? {
              key,
              parameters,
            }
          : key,
      );
    },
    parameters: parameters ?? null,
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

  const filter = useCallback(
    (
      instance: Instance<'visualizer'>,
      otherInstance: Instance<'visualizer'>,
    ) => {
      return (
        isEqual(
          Object.keys(instance.accepts.shape.shape),
          Object.keys(otherInstance.accepts.shape.shape),
        ) || errorFlowchartIncompatibleComponent
      );
    },
    [],
  );

  const filteredOptions = useFilteredObjectOptions({
    options,
    selectedOption,
    filter,
  });

  return (
    <FlowchartComponentSelect<'visualizer'>
      className={className}
      label="Problem"
      hideLabel={true}
      hideErrors={true}
      value={selectedOption}
      onChange={setSelectedOption}
      options={filteredOptions}
      evaluatedValue={visualizerEvaluation}
      defaultParameters={defaultParameters}
      parameters={parameters ?? null}
    />
  );
}
