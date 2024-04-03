import { error } from '@app/errors';
import { useBoxContext } from '@components/box-page';
import { Instance } from '@components/box-page/box-context/sandbox-object';
import FlowchartComponentSelect from '@components/flowchart/FlowchartComponentSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { errorFlowchartIncompatibleComponent } from '@constants/flowchart';
import getUsedSlotsForAlias from '@utils/box-config/getUsedSlotsForAlias';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import { useCallback, useMemo } from 'react';

import { useFilteredObjectOptions } from './useFilteredObjectOptions';

export default function FlowchartAdapterSelect({
  className,
  alias,
  hideLabel,
  hideErrors,
}: {
  alias: string;
  className?: string;
  hideLabel?: boolean;
  hideErrors?: boolean;
}) {
  const { adapterOptions } = useSandboxComponents();
  const options = useMemo(() => {
    return groupOptionsByTag(adapterOptions);
  }, [adapterOptions]);
  const setConfig = useBoxContext('config.set');
  const configTree = useBoxContext('config.tree');
  const { default: defaultAll, value: parametersAll } = useBoxContext(
    'config.evaluated.parameters',
  );
  const evaluatedAdapters = useBoxContext('config.evaluated.adapters');

  const defaultParameters = useMemo(
    () => defaultAll[alias] ?? {},
    [alias, defaultAll],
  );

  const parameters = useMemo(
    () => parametersAll[alias] ?? {},
    [alias, parametersAll],
  );

  const adapterKey = useMemo(() => {
    const keyWithParameters = (configTree.adapters ?? {})[alias];
    const { key } = parseKeyWithParameters(keyWithParameters);

    return key;
  }, [configTree.adapters, alias]);

  const adapterEvaluation =
    evaluatedAdapters[alias]?.map(({ value }) => value) ??
    error('Adapter evaluation not found');

  const adapterInstance = useMemo(() => {
    return adapterEvaluation
      .mapLeft(() => null)
      .mapRight((adapter) => {
        if ('parameters' in adapter) {
          return adapter.create();
        }

        return adapter;
      });
  }, [adapterEvaluation]);

  const value = useMemo(() => {
    return adapterOptions.find((option) => option.key === adapterKey)!;
  }, [adapterOptions, adapterKey]);

  const { usedInputSlots, usedOutputSlots } = useMemo(() => {
    const usedSlots = getUsedSlotsForAlias(configTree, alias);

    const usedInputSlots = (() => {
      if (
        usedSlots.some(({ slot, type }) => slot === '.' && type === 'input')
      ) {
        return Object.keys(
          adapterInstance.mapLeft(() => null).value?.accepts.shape.shape ?? {},
        );
      }

      return usedSlots
        .filter((slot) => slot.type === 'input')
        .map((slot) => slot.slot);
    })();

    const usedOutputSlots = (() => {
      if (
        usedSlots.some(({ slot, type }) => slot === '.' && type === 'output')
      ) {
        return Object.keys(
          adapterInstance.mapLeft(() => null).value?.outputs.shape.shape ?? {},
        );
      }

      return usedSlots
        .filter((slot) => slot.type === 'output')
        .map((slot) => slot.slot);
    })();

    return { usedInputSlots, usedOutputSlots };
  }, [configTree, alias, adapterInstance]);

  const filter = useCallback(
    (instance: Instance<'adapter'>) => {
      const inputKeys = Object.keys(instance.accepts.shape.shape);
      const outputKeys = Object.keys(instance.outputs.shape.shape);

      return (
        (usedInputSlots.every((slot) => inputKeys.includes(slot)) &&
          usedOutputSlots.every((slot) => outputKeys.includes(slot))) ||
        errorFlowchartIncompatibleComponent
      );
    },
    [usedInputSlots, usedOutputSlots],
  );

  const filteredOptions = useFilteredObjectOptions({
    options,
    filter,
  });

  return (
    <FlowchartComponentSelect<'adapter'>
      className={className}
      label="Adapter"
      hideLabel={hideLabel}
      hideErrors={hideErrors}
      value={value}
      onChange={(value, parameters) => {
        if (value === null) {
          return;
        }

        const key = value.value.key;

        setConfig({
          adapters: {
            ...configTree.adapters,
            [alias]: parameters
              ? {
                  key: key,
                  parameters,
                }
              : key,
          },
          composition: {
            ...configTree.composition,
            connections: configTree.composition.connections.filter(
              ({ fromKey, toKey }) => fromKey !== alias && toKey !== alias,
            ),
          },
        });
      }}
      options={filteredOptions}
      evaluatedValue={adapterEvaluation}
      defaultParameters={defaultParameters}
      parameters={parameters}
    />
  );
}
