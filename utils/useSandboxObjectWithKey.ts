import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useMemo } from 'react';

import getSandboxObjectWithKey from './getSandboxObjectWithKey';

export default function useSandboxObjectWithKey<T extends SandboxObjectType>({
  type,
  key,
}: {
  type: T;
  key: SandboxKey<T>;
}): SandboxComponent<T> | null {
  const builtInComponents = useBuiltInComponents();

  return useMemo(
    () =>
      getSandboxObjectWithKey({
        files: {},
        builtInComponents,
        type,
        key,
      }),
    [builtInComponents, key, type],
  );
}
