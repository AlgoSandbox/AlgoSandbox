import { SandboxStateType } from '@algo-sandbox/core';

export default function areStateTypesCompatible({
  to,
  from,
}: {
  to: SandboxStateType;
  from: SandboxStateType;
}) {
  const toKeys = Object.keys(to.shape.shape);
  const fromKeys = Object.keys(from.shape.shape);
  const isToKeysSubsetOfFromKeys = toKeys.every((key) =>
    fromKeys.includes(key),
  );

  return isToKeysSubsetOfFromKeys;
}
