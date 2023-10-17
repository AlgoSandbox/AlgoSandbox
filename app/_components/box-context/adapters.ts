import { SelectOption, SelectOptions } from '@components';
import {
  SandboxAdapter,
  SandboxStateName,
  SandboxCompositeAdapter,
  SandboxStateNameMap,
} from '@algo-sandbox/core';
import { useMemo, useState } from 'react';

type Adapter = SandboxAdapter<SandboxStateName, SandboxStateName>;

export type BoxContextAdapters = {
  composed: SandboxCompositeAdapter<
    keyof SandboxStateNameMap,
    never,
    SandboxAdapter<keyof SandboxStateNameMap, keyof SandboxStateNameMap>[]
  > | null;
  value: Array<SelectOption<Adapter>>;
  setValue: (value: Array<SelectOption<Adapter>>) => void;
  options: SelectOptions<Adapter>;
};

export const defaultBoxContextAdapters: BoxContextAdapters = {
  composed: null,
  setValue: () => {},
  value: [],
  options: [],
};

export function useBoxContextAdapters(options: SelectOptions<Adapter>) {
  const [selectedAdapters, setSelectedAdapters] = useState<
    SelectOption<Adapter>[]
  >([]);

  const composedAdapter = useMemo(() => {
    if (selectedAdapters.length === 0) {
      return null;
    }

    return SandboxAdapter.tryCompose(
      ...selectedAdapters.map(({ value }) => value)
    );
  }, [selectedAdapters]);

  const adapters = useMemo(() => {
    return {
      composed: composedAdapter,
      setValue: setSelectedAdapters,
      value: selectedAdapters,
      options,
    } satisfies BoxContextAdapters;
  }, [composedAdapter, options, selectedAdapters]);

  return adapters;
}
