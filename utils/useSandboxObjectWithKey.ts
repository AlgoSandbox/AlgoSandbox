import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { ErrorOr } from '@app/errors/ErrorContext';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useMemo } from 'react';

import getSandboxObjectWithKey from './getSandboxObjectWithKey';

export default function useSandboxObjectWithKey<T extends SandboxObjectType>({
  type,
  key,
}: {
  type: T;
  key: SandboxKey<T>;
}): ErrorOr<SandboxComponent<T>> {
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
