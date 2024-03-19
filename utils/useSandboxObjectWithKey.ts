import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { ErrorOr } from '@app/errors';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useMemo } from 'react';

import getSandboxObjectWithKey from './getSandboxObjectWithKey';

export default function useSandboxObjectWithKey<T extends SandboxObjectType>({
  type,
  key,
}: {
  type: T;
  key: SandboxKey<T>;
}): ErrorOr<SandboxComponent<T>> {
  const sandboxComponents = useSandboxComponents();

  return useMemo(
    () =>
      getSandboxObjectWithKey({
        files: {},
        sandboxComponents,
        type,
        key,
      }),
    [sandboxComponents, key, type],
  );
}
