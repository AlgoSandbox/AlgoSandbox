import {
  AdapterConfiguration,
  AdapterConfigurationFlat,
  SandboxAdapter,
  SandboxCompositeAdapter,
  SandboxEvaluated,
  SandboxStateType,
  tryCompose,
} from '@algo-sandbox/core';
import { ErrorOr } from '@app/errors/ErrorContext';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { SandboxAnyAdapter } from '@typings/algo-sandbox';
import { DbAdapterSaved } from '@utils/db';
import { evalSavedObject } from '@utils/evalSavedObject';
import { useMemo } from 'react';

export type BoxContextAdapters = {
  composed: SandboxCompositeAdapter<
    SandboxStateType,
    SandboxStateType,
    SandboxAdapter<SandboxStateType, SandboxStateType>[]
  > | null;
  config: AdapterConfiguration;
  value: Array<CatalogOption<DbAdapterSaved>>;
  evaluated: Array<SandboxEvaluated<ErrorOr<SandboxAnyAdapter>>>;
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
  options,
  adapterConfiguration,
  onAdapterConfigurationChange,
}: {
  options: Array<CatalogGroup<DbAdapterSaved>>;
  adapterConfiguration: AdapterConfigurationFlat;
  onAdapterConfigurationChange: (config: AdapterConfigurationFlat) => void;
}) {
  const selectedAdapters = useMemo(() => {
    return Object.values(adapterConfiguration.aliases).map((key) => {
      const option = options
        .flatMap((group) => group.options)
        .find((option) => option.value.key === key);

      if (option === undefined) {
        throw new Error(`Adapter ${key} not found`);
      }

      return option;
    });
  }, [adapterConfiguration, options]);

  const evaluated: Array<SandboxEvaluated<ErrorOr<SandboxAnyAdapter>>> =
    useMemo(() => {
      return selectedAdapters.map(({ label, key, value: object }) => ({
        value: evalSavedObject<'adapter'>(object),
        name: label,
        key,
      }));
    }, [selectedAdapters]);

  const composedAdapter = useMemo(() => {
    if (evaluated.length === 0) {
      return null;
    }

    if (evaluated.some((adapter) => adapter.value.isLeft())) {
      return null;
    }

    return tryCompose(...evaluated.map(({ value }) => value.unwrap()));
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
      options,
      evaluated,
    };

    return value;
  }, [
    composedAdapter,
    adapterConfiguration,
    selectedAdapters,
    options,
    evaluated,
    onAdapterConfigurationChange,
  ]);

  return adapters;
}
