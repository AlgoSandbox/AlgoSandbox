import { useBoxContext } from '@components/box-page';
import {
  Instance,
  useBoxContextSandboxObject,
} from '@components/box-page/box-context/sandbox-object';
import FlowchartComponentSelect from '@components/flowchart/FlowchartComponentSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { errorFlowchartIncompatibleComponent } from '@constants/flowchart';
import getUsedSlotsForAlias from '@utils/box-config/getUsedSlotsForAlias';
import {
  useAddSavedVisualizerMutation,
  useRemoveSavedVisualizerMutation,
  useSavedVisualizersQuery,
  useSetSavedVisualizerMutation,
} from '@utils/db/visualizers';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { useCallback, useMemo } from 'react';

import { useFilteredObjectOptions } from './useFilteredObjectOptions';

export default function FlowchartVisualizerSelect({
  alias,
  className,
  hideLabel,
  hideErrors,
}: {
  alias: string;
  className?: string;
  hideLabel?: boolean;
  hideErrors?: boolean;
}) {
  const { visualizerOptions } = useSandboxComponents();
  const configTree = useBoxContext('config.tree');
  const aliases = useBoxContext('visualizers.aliases');
  const setAlias = useBoxContext('visualizers.setAlias');
  const instances = useBoxContext('visualizers.instances');

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

  const visualizerInstance = useMemo(
    () => instances[alias],
    [alias, instances],
  );

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

  const { usedInputSlots } = useMemo(() => {
    const usedSlots = getUsedSlotsForAlias(configTree, alias);

    const usedInputSlots = (() => {
      if (
        usedSlots.some(({ slot, type }) => slot === '.' && type === 'input')
      ) {
        return Object.keys(
          visualizerInstance.mapLeft(() => null).value?.value.accepts.shape
            .shape ?? {},
        );
      }

      return usedSlots
        .filter((slot) => slot.type === 'input')
        .map((slot) => slot.slot);
    })();

    return { usedInputSlots };
  }, [configTree, alias, visualizerInstance]);

  const filter = useCallback(
    (instance: Instance<'visualizer'>) => {
      const inputKeys = Object.keys(instance.accepts.shape.shape);

      return (
        usedInputSlots.every((slot) => inputKeys.includes(slot)) ||
        errorFlowchartIncompatibleComponent
      );
    },
    [usedInputSlots],
  );

  const filteredOptions = useFilteredObjectOptions({
    options,
    filter,
  });

  return (
    <FlowchartComponentSelect<'visualizer'>
      className={className}
      label="Visualizer"
      hideLabel={hideLabel}
      hideErrors={hideErrors}
      value={selectedOption}
      onChange={setSelectedOption}
      options={filteredOptions}
      evaluatedValue={visualizerEvaluation}
      defaultParameters={defaultParameters}
      parameters={parameters ?? null}
    />
  );
}
