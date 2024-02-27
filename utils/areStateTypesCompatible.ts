import { SandboxStateType } from '@algo-sandbox/core';

export default function areStateTypesCompatible({
  to,
  from,
}: {
  to: SandboxStateType;
  from: SandboxStateType;
}) {
  const inputKeys = Object.keys(to.shape.shape);
  const outputKeys = Object.keys(from.shape.shape);
  const isOutputKeysSubsetOfInputKeys = outputKeys.every((key) =>
    inputKeys.includes(key),
  );

  return isOutputKeysSubsetOfInputKeys;
}
