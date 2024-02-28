import {
  AdapterConfigurationFlat,
  getDefaultParameters,
  ParsedParameters,
  SandboxAdapter,
  SandboxEvaluated,
  SandboxParameters,
  SandboxStateType,
  tryCompose,
} from '@algo-sandbox/core';
import { error, ErrorOr, success } from '@app/errors/ErrorContext';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { SandboxAnyAdapter } from '@typings/algo-sandbox';
import { DbAdapterSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { compact, mapValues } from 'lodash';
import { useMemo, useState } from 'react';

export type BoxContextAdapters = {
  composed: ErrorOr<SandboxAdapter<SandboxStateType, SandboxStateType> | null>;
  config: AdapterConfigurationFlat;
  selectedOptions: Record<string, CatalogOption<DbAdapterSaved>>;
  evaluations: Record<string, SandboxEvaluated<ErrorOr<SandboxAnyAdapter>>>;
  setConfig: (config: AdapterConfigurationFlat) => void;
  options: Array<CatalogGroup<DbAdapterSaved>>;
  parameters: {
    default: Record<string, ParsedParameters<SandboxParameters> | null>;
    value: Record<string, ParsedParameters<SandboxParameters> | null>;
    setValue: (
      alias: string,
      value: ParsedParameters<SandboxParameters>,
    ) => void;
  };
};

export const defaultBoxContextAdapters: BoxContextAdapters = {
  composed: success(null),
  config: { aliases: {}, composition: { type: 'flat', order: [] } },
  setConfig: () => {},
  selectedOptions: {},
  options: [],
  evaluations: {},
  parameters: {
    value: {},
    default: {},
    setValue: () => {},
  },
};

export function useBoxContextAdapters({
  options,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  options: Array<CatalogGroup<DbAdapterSaved>>;
  adapterConfiguration: AdapterConfigurationFlat;
  onAdapterConfigurationChange: (config: AdapterConfigurationFlat) => void;
}) {
  const [parameters, setParameters] = useState<
    Record<string, ParsedParameters<SandboxParameters> | null>
  >({});

  const selectedAdapters = useMemo(() => {
    return mapValues(adapterConfiguration.aliases, (key) => {
      const option = options
        .flatMap((group) => group.options)
        .find((option) => option.value.key === key);

      if (option === undefined) {
        throw new Error(`Adapter ${key} not found`);
      }

      return option;
    });
  }, [adapterConfiguration, options]);

  const evaluations: Record<
    string,
    SandboxEvaluated<ErrorOr<SandboxAnyAdapter>>
  > = useMemo(() => {
    return mapValues(selectedAdapters, ({ label, key, value: object }) => ({
      value: evalSavedObject<'adapter'>(object),
      name: label,
      key,
    }));
  }, [selectedAdapters]);

  const defaultParameters = useMemo(() => {
    return mapValues(evaluations, (evaluation) => {
      return evaluation.value
        .map((adapter) => {
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
    return mapValues(evaluations, ({ value: evaluation, name, key }, alias) => {
      return evaluation.map((adapter) => {
        const params = parameters[alias] ?? defaultParameters[alias];
        const instance =
          'parameters' in adapter ? adapter.create(params ?? {}) : adapter;

        return { value: instance, name, key };
      });
    });
  }, [defaultParameters, evaluations, parameters]);

  const composedAdapter: ErrorOr<SandboxAdapter<
    SandboxStateType,
    SandboxStateType
  > | null> = useMemo(() => {
    if (Object.keys(instances).length === 0) {
      return success(null);
    }

    if (Object.values(instances).some((adapter) => adapter.isLeft())) {
      const errors = Object.values(instances).flatMap(
        (adapter) => adapter.mapRight(() => []).value,
      );
      return error(
        'Error while creating composed adapter',
        ...errors.map(({ message }) => message),
      );
    }

    const orderedInstances = compact(
      adapterConfiguration.composition.order.map(
        (key) => instances[key]?.unwrap() ?? null,
      ),
    );

    const composed = tryCompose(
      ...orderedInstances.map(({ value }) => value),
    ) as SandboxAdapter<SandboxStateType, SandboxStateType> | null;

    if (composed === null) {
      return error('Error while creating composed adapter');
    }

    return success(composed);
  }, [adapterConfiguration.composition.order, instances]);

  const adapters = useMemo(() => {
    const value: BoxContextAdapters = {
      composed: composedAdapter,
      config: adapterConfiguration,
      setConfig: (config) => {
        onAdapterConfigurationChange(config);
      },
      selectedOptions: selectedAdapters,
      options,
      evaluations,
      parameters: {
        value: parameters,
        default: defaultParameters,
        setValue: (alias, value) => {
          setParameters((prev) => ({ ...prev, [alias]: value }));
        },
      },
    };

    return value;
  }, [
    composedAdapter,
    adapterConfiguration,
    options,
    parameters,
    defaultParameters,
    onAdapterConfigurationChange,
    selectedAdapters,
    evaluations,
  ]);

  return adapters;
}
