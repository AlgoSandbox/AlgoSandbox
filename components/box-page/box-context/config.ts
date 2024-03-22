import {
  AdapterCompositionTree,
  BoxConfig,
  BoxConfigTree,
  getDefaultParameters,
  ParsedParameters,
  SandboxAdapter,
  SandboxEvaluated,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';
import { error, ErrorOr, success } from '@app/errors';
import { CatalogOption } from '@constants/catalog';
import { SandboxAnyAdapter } from '@typings/algo-sandbox';
import convertBoxConfigToTree from '@utils/convertBoxConfigToTree';
import { DbAdapterSaved } from '@utils/db';
import evalSavedObject from '@utils/eval/evalSavedObject';
import parseKeyWithParameters from '@utils/parseKeyWithParameters';
import _ from 'lodash';
import { mapValues } from 'lodash';
import { useCallback, useMemo } from 'react';

export const defaultBoxContextConfig: BoxContextConfig = {
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

export type BoxContextConfig = {
  raw: BoxConfig;
  tree: BoxConfigTree;
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
  set: (value: BoxConfigTree) => void;
};

export default function useBoxContextConfig({
  adapterOptions,
  visualizerInputKeys,
  value,
  onChange,
}: {
  problemOutputKeys: Array<string>;
  algorithmOutputKeys: Array<string>;
  visualizerInputKeys: Record<string, Array<string>>;
  adapterOptions: Array<CatalogOption<DbAdapterSaved>>;
  value: BoxConfig;
  onChange: (value: BoxConfig) => void;
}) {
  // const [parameters, setParameters] = useState<
  //   Record<string, ParsedParameters<SandboxParameters> | null>
  // >({});

  const parameters = useMemo(() => {
    return mapValues(value.adapters ?? {}, (keyWithParameters) => {
      const { parameters } = parseKeyWithParameters(keyWithParameters);

      return parameters ?? null;
    });
  }, [value.adapters]);

  const setAliasParameter = useCallback(
    (alias: string, parameters: Record<string, unknown> | null) => {
      if (value.adapters === undefined) {
        return;
      }
      const keyWithParameters = value.adapters[alias];
      const { key } = parseKeyWithParameters(keyWithParameters);

      if (parameters === null) {
        onChange({
          ...value,
          adapters: _.omit(value.adapters, alias),
        });
        return;
      }

      onChange({
        ...value,
        adapters: {
          ...value.adapters,
          [alias]: {
            key,
            parameters,
          },
        },
      });
    },
    [onChange, value],
  );

  const selectedAdapters: Record<
    string,
    ErrorOr<CatalogOption<DbAdapterSaved>>
  > = useMemo(() => {
    return mapValues(value?.adapters ?? {}, (keyWithParameters) => {
      const { key } = parseKeyWithParameters(keyWithParameters);
      const option = adapterOptions.find((option) => option.value.key === key);

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
    const visualizerAliases = Object.keys(visualizerInputKeys);
    return convertBoxConfigToTree(value, visualizerAliases);
  }, [value, visualizerInputKeys]);

  const config = useMemo(() => {
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
            setAliasParameter(alias, value);
          },
        },
      },
      set: (newValue: BoxConfig) => {
        onChange(newValue);
      },
    } satisfies BoxContextConfig;
  }, [
    value,
    treeConfiguration,
    evaluations,
    instances,
    parameters,
    defaultParameters,
    setAliasParameter,
    onChange,
  ]);

  return config;
}
