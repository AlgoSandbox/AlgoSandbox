import {
  SandboxComponent,
  SandboxKey,
  SandboxObjectType,
} from '@algo-sandbox/components/SandboxKey';
import { ErrorOr } from '@app/errors';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';

import evalWithAlgoSandbox from './eval/evalWithAlgoSandbox';
import getSandboxObjectWithKeyImpl from './getSandboxObjectWithKeyImpl';

export default function getSandboxObjectWithKey<T extends SandboxObjectType>({
  type,
  key,
  sandboxComponents,
  files,
}: {
  type: T;
  key: SandboxKey<T>;
  files: Record<string, string>;
  sandboxComponents: SandboxComponents;
}): ErrorOr<SandboxComponent<T>> {
  return getSandboxObjectWithKeyImpl({
    type,
    key,
    sandboxComponents,
    files,
    evalFn: evalWithAlgoSandbox,
  });
}
