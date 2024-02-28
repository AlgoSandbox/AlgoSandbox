import {
  AdapterCompositionTree,
  AlgorithmVisualizers,
  AlgorithmVisualizersTree,
  getDefaultParameters,
  ParsedParameters,
  SandboxAdapter,
  SandboxEvaluated,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';
import { error, ErrorOr, success } from '@app/errors/ErrorContext';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { SandboxAnyAdapter } from '@typings/algo-sandbox';
import { DbAdapterSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { compact, mapValues } from 'lodash';
import { useMemo, useState } from 'react';

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
      adapterInstances: {},
      composition: { type: 'tree', connections: [] },
      parameters: {
        default: {},
        value: {},
        setValue: () => {},
      },
    },
    set: () => {},
  };

export type BoxContextAlgorithmVisualizers = {
  raw: AlgorithmVisualizers;
  tree: AlgorithmVisualizersTree;
  evaluated: {
    adapters: Record<string, ErrorOr<SandboxEvaluated<SandboxAnyAdapter>>>;
    adapterInstances: Record<
      string,
      ErrorOr<
        SandboxEvaluated<SandboxAdapter<SandboxStateType, SandboxStateType>>
      >
    >;
    composition: AdapterCompositionTree;
    parameters: {
      default: Record<string, ParsedParameters<SandboxParameters> | null>;
      value: Record<string, ParsedParameters<SandboxParameters> | null>;
      setValue: (
        alias: string,
        value: ParsedParameters<SandboxParameters> | null,
      ) => void;
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
  const [parameters, setParameters] = useState<
    Record<string, ParsedParameters<SandboxParameters> | null>
  >({});

  const selectedAdapters: Record<
    string,
    ErrorOr<CatalogOption<DbAdapterSaved>>
  > = useMemo(() => {
    return mapValues(value?.adapters ?? {}, (key) => {
      const option = adapterOptions
        .flatMap((group) => group.options)
        .find((option) => option.value.key === key);

      if (option === undefined) {
        return error(`Adapter ${key} not found`) as ErrorOr<
          CatalogOption<DbAdapterSaved>
        >;
      }

      return success(option);
    });
  }, [value?.adapters, adapterOptions]);

  const evaluations = useMemo(() => {
    return mapValues(selectedAdapters, (option) => {
      return option.chain((adapter) => {
        const adapterEvaluation = evalSavedObject<'adapter'>(adapter.value);

        return adapterEvaluation.map((value) => ({
          value,
          name: adapter.label,
          key: adapter.value.key,
        }));
      });
    });
  }, [selectedAdapters]);

  const defaultParameters = useMemo(() => {
    return mapValues(evaluations, (evaluation) => {
      return evaluation
        .map(({ value: adapter }) => {
          const defaultParams =
            'parameters' in adapter
              ? getDefaultParameters(adapter.parameters)
              : null;

          return defaultParams;
        })
        .mapLeft(() => null).value;
    });
  }, [evaluations]);

  const instances = useMemo(() => {
    return mapValues(evaluations, (evaluation, alias) => {
      return evaluation.map(({ value: adapter, name, key }) => {
        const params = parameters[alias] ?? defaultParameters[alias];
        const instance =
          'parameters' in adapter ? adapter.create(params ?? {}) : adapter;

        return { value: instance, name, key };
      });
    });
  }, [defaultParameters, evaluations, parameters]);

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
        adapters: evaluations,
        adapterInstances: instances,
        parameters: {
          value: parameters,
          default: defaultParameters,
          setValue: (alias, value) => {
            setParameters((prev) => ({ ...prev, [alias]: value }));
          },
        },
      },
      set: (newValue: AlgorithmVisualizers) => {
        onChange(newValue);
      },
    } satisfies BoxContextAlgorithmVisualizers;
  }, [
    value,
    treeConfiguration,
    evaluations,
    instances,
    parameters,
    defaultParameters,
    onChange,
  ]);

  return algorithmVisualizers;
}
