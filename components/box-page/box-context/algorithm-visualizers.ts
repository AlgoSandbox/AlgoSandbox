import {
  AdapterConnection,
  AlgorithmVisualizers,
  AlgorithmVisualizersEvaluated,
  AlgorithmVisualizersTree,
} from '@algo-sandbox/core';
import { CatalogGroup } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { useMemo } from 'react';

export const defaultBoxContextAlgorithmVisualizer: BoxContextAlgorithmVisualizers =
  {
    raw: {
      adapters: {},
      composition: { type: 'tree', connections: [] },
    },
    tree: {
      adapters: {},
      composition: { type: 'tree', connections: [] },
    },
    evaluated: {
      adapters: {},
      composition: { type: 'tree', connections: [] },
    },
    set: () => {},
  };

export type BoxContextAlgorithmVisualizers = {
  raw: AlgorithmVisualizers;
  tree: AlgorithmVisualizersTree;
  evaluated: AlgorithmVisualizersEvaluated & {
    composition: {
      type: 'tree';
    };
  };
  set: (value: AlgorithmVisualizersTree) => void;
};

export default function useBoxContextAlgorithmVisualizers({
  builtInAdapterOptions,
  problemOutputKeys,
  algorithmOutputKeys,
  visualizerInputKeys,
  value,
  onChange,
}: {
  problemOutputKeys: Array<string>;
  algorithmOutputKeys: Array<string>;
  visualizerInputKeys: Record<string, Array<string>>;
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  value: AlgorithmVisualizers;
  onChange: (value: AlgorithmVisualizers) => void;
}) {
  const selectedAdapterOptions = useMemo(() => {
    return Object.fromEntries(
      Object.entries(value?.adapters ?? {}).map(([alias, adapterKey]) => [
        alias,
        builtInAdapterOptions
          .flatMap((group) => group.options)
          .find((option) => option.value.key === adapterKey),
      ]),
    );
  }, [value?.adapters, builtInAdapterOptions]);

  const adapterEvaluations = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedAdapterOptions).map(([alias, option]) => {
        if (option === undefined) {
          throw new Error(`Adapter ${alias} not found`);
        }

        const value = evalSavedObject<'adapter'>(option.value).objectEvaled;

        return [
          alias,
          value
            ? {
                value,
                name: option.label,
                key: alias,
              }
            : undefined,
        ];
      }),
    );
  }, [selectedAdapterOptions]);

  const treeConfiguration = useMemo(() => {
    const type = value.composition.type;
    if (type === 'tree') {
      return value as AlgorithmVisualizersTree;
    } else {
      const adapterOutputKeys = Object.fromEntries(
        Object.entries(adapterEvaluations).map(([alias, evaluation]) => [
          alias,
          Object.keys(evaluation?.value.outputs.shape.shape ?? {}),
        ]),
      );
      const adapterInputKeys = Object.fromEntries(
        Object.entries(adapterEvaluations).map(([alias, evaluation]) => [
          alias,
          Object.keys(evaluation?.value.accepts.shape.shape ?? {}),
        ]),
      );

      const outputKeys: Record<string, Array<string>> = {
        algorithm: algorithmOutputKeys,
        ...adapterOutputKeys,
      };

      const inputKeys: Record<string, Array<string>> = {
        ...visualizerInputKeys,
        ...adapterInputKeys,
      };

      // Try to generate edges between algorithm -> adapter 1 -> adapter 2 -> visualizer/s
      const orderedAdapterAliases = value.composition.order;
      const orderedNodeAliases = ['algorithm', ...orderedAdapterAliases];
      const lastNode = orderedNodeAliases[orderedNodeAliases.length - 1];

      const nodeConnections = orderedNodeAliases.flatMap((alias, index) => {
        if (alias === 'algorithm' || alias === 'problem') {
          return [];
        }

        const previousAlias = orderedNodeAliases[index - 1];
        const previousOutputs = outputKeys[previousAlias];
        const currentInputs = inputKeys[alias];

        const connections: Array<AdapterConnection> = previousOutputs.flatMap(
          (outputKey) => {
            return currentInputs.map((inputKey) => {
              return {
                fromKey: previousAlias,
                fromSlot: outputKey,
                toKey: alias,
                toSlot: inputKey,
              };
            });
          },
        );

        return connections;
      });

      const lastNodeOutputKeys = outputKeys[lastNode];

      const visualizerConnections = Object.entries(visualizerInputKeys).flatMap(
        ([visualizerAlias, inputKeys]) => {
          return inputKeys
            .filter((inputKey) => lastNodeOutputKeys.includes(inputKey))
            .map((inputKey) => {
              return {
                fromKey: lastNode,
                fromSlot: inputKey,
                toKey: visualizerAlias,
                toSlot: inputKey,
              };
            });
        },
      );

      const convertedConfiguration: AlgorithmVisualizersTree = {
        adapters: value.adapters ?? {},
        composition: {
          type: 'tree',
          connections: [...nodeConnections, ...visualizerConnections],
        },
      };
      return convertedConfiguration;
    }
  }, [adapterEvaluations, algorithmOutputKeys, value, visualizerInputKeys]);

  const algorithmVisualizers = useMemo(() => {
    return {
      raw: value,
      tree: treeConfiguration,
      evaluated: {
        ...treeConfiguration,
        adapters: adapterEvaluations,
      },
      set: (newValue: AlgorithmVisualizers) => {
        onChange(newValue);
      },
    } satisfies BoxContextAlgorithmVisualizers;
  }, [value, treeConfiguration, adapterEvaluations, onChange]);

  return algorithmVisualizers;
}
