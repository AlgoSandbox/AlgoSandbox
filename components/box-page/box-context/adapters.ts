import {
  SandboxAdapter,
  SandboxCompositeAdapter,
  SandboxStateType,
  tryCompose,
} from '@algo-sandbox/core';
import { SelectOption, SelectOptions } from '@components/ui';
import { useMemo, useState } from 'react';

type Adapter = SandboxAdapter<SandboxStateType, SandboxStateType>;

export type BoxContextAdapters = {
  composed: SandboxCompositeAdapter<
    SandboxStateType,
    SandboxStateType,
    SandboxAdapter<SandboxStateType, SandboxStateType>[]
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

    return tryCompose(...selectedAdapters.map(({ value }) => value));
  }, [selectedAdapters]);

  const adapters = useMemo(() => {
    const value: BoxContextAdapters = {
      composed: composedAdapter,
      setValue: setSelectedAdapters,
      value: selectedAdapters,
      options,
    };

    return value;
  }, [composedAdapter, options, selectedAdapters]);

  return adapters;
}
