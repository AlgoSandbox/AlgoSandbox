import {
  AdapterConfiguration,
  AdapterConfigurationEvaluated,
  AdapterConfigurationTree,
  AdapterConnection,
} from '@algo-sandbox/core';
import { CatalogGroup } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { useMemo } from 'react';

export const defaultBoxContextAlgorithmVisualizer: BoxContextAlgorithmVisualizers =
  {
    adapterConfiguration: {
      raw: {
        aliases: {},
        composition: { type: 'tree', connections: [] },
      },
      tree: {
        aliases: {},
        composition: { type: 'tree', connections: [] },
      },
      evaluated: {
        aliases: {},
        composition: { type: 'tree', connections: [] },
      },
      set: () => {},
    },
  };

export type BoxContextAlgorithmVisualizers = {
  adapterConfiguration: {
    raw: AdapterConfiguration;
    tree: AdapterConfigurationTree;
    evaluated: AdapterConfigurationEvaluated & {
      composition: {
        type: 'tree';
      };
    };
    set: (configuration: AdapterConfiguration) => void;
  };
};

export default function useBoxContextAlgorithmVisualizers({
  builtInAdapterOptions,
  problemOutputKeys,
  algorithmOutputKeys,
  visualizerInputKeys,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  problemOutputKeys: Array<string>;
  algorithmOutputKeys: Array<string>;
  visualizerInputKeys: Record<string, Array<string>>;
  builtInAdapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  adapterConfiguration: AdapterConfiguration;
  onAdapterConfigurationChange: (config: AdapterConfiguration) => void;
}) {
  // const adapters = useBoxContextAdapters({
  //   builtInOptions: builtInAdapterOptions,
  //   adapterConfiguration,
  //   onAdapterConfigurationChange,
  // });

  const selectedAdapterOptions = useMemo(() => {
    return Object.fromEntries(
      Object.entries(adapterConfiguration.aliases).map(
        ([alias, adapterKey]) => [
          alias,
          builtInAdapterOptions
            .flatMap((group) => group.options)
            .find((option) => option.value.key === adapterKey),
        ],
      ),
    );
  }, [adapterConfiguration, builtInAdapterOptions]);

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
    const type = adapterConfiguration.composition.type;
    if (type === 'tree') {
      return adapterConfiguration as AdapterConfigurationTree;
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

      // Try to generate edges between algorithm -> adapter 1->adapter 2->visualizer/s

      const orderedAdapterAliases = adapterConfiguration.composition.order;
      const orderedNodeAliases = ['algorithm', ...orderedAdapterAliases];
      const lastNode = orderedNodeAliases[orderedNodeAliases.length - 1];

      const nodeConnections = orderedNodeAliases.flatMap((alias, index) => {
        if (index === 0) {
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

      const convertedConfiguration: AdapterConfigurationTree = {
        aliases: adapterConfiguration.aliases,
        composition: {
          type: 'tree',
          connections: [...nodeConnections, ...visualizerConnections],
        },
      };
      return convertedConfiguration;
    }
  }, [
    adapterConfiguration,
    adapterEvaluations,
    algorithmOutputKeys,
    visualizerInputKeys,
  ]);

  const algorithmVisualizers = useMemo(() => {
    return {
      adapterConfiguration: {
        raw: adapterConfiguration,
        tree: treeConfiguration,
        evaluated: {
          ...treeConfiguration,
          aliases: adapterEvaluations,
        },
        set: (configuration: AdapterConfiguration) => {
          onAdapterConfigurationChange(configuration);
        },
      },
    } satisfies BoxContextAlgorithmVisualizers;
  }, [
    adapterConfiguration,
    adapterEvaluations,
    onAdapterConfigurationChange,
    treeConfiguration,
  ]);

  return algorithmVisualizers;
}
