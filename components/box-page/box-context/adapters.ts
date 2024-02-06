import {
  AdapterConfiguration,
  AdapterConfigurationFlat,
  SandboxAdapter,
  SandboxCompositeAdapter,
  SandboxStateType,
  tryCompose,
} from '@algo-sandbox/core';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { DbObjectEvaluation, evalSavedObject } from '@utils/evalSavedObject';
import { useMemo } from 'react';

export type BoxContextAdapters = {
  composed: SandboxCompositeAdapter<
    SandboxStateType,
    SandboxStateType,
    SandboxAdapter<SandboxStateType, SandboxStateType>[]
  > | null;
  config: AdapterConfiguration;
  value: Array<CatalogOption<DbAdapterSaved>>;
  evaluated: Array<{
    evaluation: DbObjectEvaluation<'adapter'>;
    key: string;
    label: string;
  }>;
  setValue: (value: Array<CatalogOption<DbAdapterSaved>>) => void;
  options: Array<CatalogGroup<DbAdapterSaved>>;
};

export const defaultBoxContextAdapters: BoxContextAdapters = {
  composed: null,
  config: { aliases: {}, composition: { type: 'flat', order: [] } },
  setValue: () => {},
  value: [],
  options: [],
  evaluated: [],
};

export function useBoxContextAdapters({
  builtInOptions,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  builtInOptions: Array<CatalogGroup<DbAdapterSaved>>;
  adapterConfiguration: AdapterConfigurationFlat;
  onAdapterConfigurationChange: (config: AdapterConfigurationFlat) => void;
}) {
  const selectedAdapters = useMemo(() => {
    return Object.values(adapterConfiguration.aliases).map((key) => {
      const option = builtInOptions
        .flatMap((group) => group.options)
        .find((option) => option.value.key === key);

      if (option === undefined) {
        throw new Error(`Adapter ${key} not found`);
      }

      return option;
    });
  }, [adapterConfiguration, builtInOptions]);

  const evaluated = useMemo(() => {
    return selectedAdapters.map(({ label, key, value: object }) => ({
      evaluation: evalSavedObject<'adapter'>(object),
      label,
      key,
    }));
  }, [selectedAdapters]);

  const composedAdapter = useMemo(() => {
    if (evaluated.length === 0) {
      return null;
    }

    if (evaluated.some((adapter) => adapter.evaluation.objectEvaled === null)) {
      return null;
    }

    return tryCompose(
      ...evaluated.map(({ evaluation: { objectEvaled } }) => objectEvaled!),
    );
  }, [evaluated]);

  const adapters = useMemo(() => {
    const value: BoxContextAdapters = {
      composed: composedAdapter,
      config: adapterConfiguration,
      setValue: (adapters) => {
        onAdapterConfigurationChange({
          aliases: Object.fromEntries(
            adapters.map(({ value }, index) => [`adapter-${index}`, value.key]),
          ),
          composition: {
            type: 'flat',
            order: adapters.map(({ key }) => key),
          },
        });
      },
      value: selectedAdapters,
      options: builtInOptions,
      evaluated,
    };

    return value;
  }, [
    composedAdapter,
    adapterConfiguration,
    selectedAdapters,
    builtInOptions,
    evaluated,
    onAdapterConfigurationChange,
  ]);

  return adapters;
}
