import { SandboxKey } from '@algo-sandbox/components/SandboxKey';
import { useState } from 'react';

export type BoxContextVisualizers = ReturnType<typeof useBoxContextVisualizers>;

export default function useBoxContextVisualizers() {
  const [aliases, setAliases] = useState<
    Record<string, SandboxKey<'visualizer'>>
  >({});
  const [order, setOrder] = useState<string[]>([]);

  return {
    aliases,
    order,
    setAlias: (alias: string, key: SandboxKey<'visualizer'>) => {
      setAliases((aliases) => ({ ...aliases, [alias]: key }));
    },
    appendAlias: (alias: string, key: SandboxKey<'visualizer'>) => {
      setAliases((aliases) => ({ ...aliases, [alias]: key }));
      setOrder((order) => [...order, alias]);
    },
    removeAlias: (alias: string) => {
      setAliases((aliases) => {
        const newAliases = { ...aliases };
        delete newAliases[alias];
        return newAliases;
      });
      setOrder((order) => order.filter((o) => o !== alias));
    },
  };
}
