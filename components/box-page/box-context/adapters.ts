import {
  SandboxAdapter,
  SandboxCompositeAdapter,
  SandboxStateType,
  tryCompose,
} from '@algo-sandbox/core';
import { CatalogGroup, CatalogOption } from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { DbObjectEvaluation, evalSavedObject } from '@utils/evalSavedObject';
import { useMemo, useState } from 'react';

export type BoxContextAdapters = {
  composed: SandboxCompositeAdapter<
    SandboxStateType,
    SandboxStateType,
    SandboxAdapter<SandboxStateType, SandboxStateType>[]
  > | null;
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
  setValue: () => {},
  value: [],
  options: [],
  evaluated: [],
};

export function useBoxContextAdapters(
  options: Array<CatalogGroup<DbAdapterSaved>>,
) {
  const [selectedAdapters, setSelectedAdapters] = useState<
    CatalogOption<DbAdapterSaved>[]
  >([]);

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
      setValue: setSelectedAdapters,
      value: selectedAdapters,
      options,
      evaluated,
    };

    return value;
  }, [composedAdapter, evaluated, options, selectedAdapters]);

  return adapters;
}
