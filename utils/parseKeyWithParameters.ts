import { SandboxKey } from '@algo-sandbox/components';
import { SandboxKeyWithParameters } from '@algo-sandbox/core';

export default function parseKeyWithParameters<T extends SandboxKey>(
  keyWithParameters: SandboxKeyWithParameters<T> | undefined,
): {
  key: T;
  parameters: Record<string, unknown> | undefined;
} {
  if (typeof keyWithParameters === 'string') {
    return { key: keyWithParameters, parameters: undefined };
  }

  return (
    keyWithParameters ?? {
      key: '' as T,
      parameters: undefined,
    }
  );
}
