import {
  AlgorithmVisualizers,
  AlgorithmVisualizersEvaluated,
  AlgorithmVisualizersTree,
} from '@algo-sandbox/core';
import { unwrapErrorOr } from '@app/errors/ErrorContext';
import { CatalogGroup } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { compact } from 'lodash';
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
  adapterOptions,
  visualizerInputKeys,
  value,
  onChange,
}: {
  problemOutputKeys: Array<string>;
  algorithmOutputKeys: Array<string>;
  visualizerInputKeys: Record<string, Array<string>>;
  adapterOptions: Array<CatalogGroup<DbAdapterSaved>>;
  value: AlgorithmVisualizers;
  onChange: (value: AlgorithmVisualizers) => void;
}) {
  const selectedAdapterOptions = useMemo(() => {
    return Object.fromEntries(
      Object.entries(value?.adapters ?? {}).map(([alias, adapterKey]) => [
        alias,
        adapterOptions
          .flatMap((group) => group.options)
          .find((option) => option.value.key === adapterKey),
      ]),
    );
  }, [value?.adapters, adapterOptions]);

  const adapterEvaluations = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedAdapterOptions).map(([alias, option]) => {
        if (option === undefined) {
          throw new Error(`Adapter ${alias} not found`);
        }

        const value = unwrapErrorOr(evalSavedObject<'adapter'>(option.value));

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
      // Try to generate edges between algorithm -> adapter 1 -> adapter 2 -> visualizer/s
      const orderedAdapterAliases = value.composition.order;
      const orderedNodeAliases = ['algorithm', ...orderedAdapterAliases];
      const lastNode = orderedNodeAliases[orderedNodeAliases.length - 1];

      const nodeConnections = compact(
        orderedNodeAliases.map((alias, index) => {
          if (alias === 'algorithm' || alias === 'problem') {
            return null;
          }

          const previousAlias = orderedNodeAliases[index - 1];
          return {
            fromKey: previousAlias,
            fromSlot: '.',
            toKey: alias,
            toSlot: '.',
          };
        }),
      );

      const visualizerConnections = Object.keys(visualizerInputKeys).map(
        (visualizerAlias) => {
          return {
            fromKey: lastNode,
            fromSlot: '.',
            toKey: visualizerAlias,
            toSlot: '.',
          };
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
  }, [value, visualizerInputKeys]);

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
