import {
  SandboxNullableStateType,
  SandboxState,
  SandboxStateType,
} from '../state';

export type SandboxAdapter<
  N extends SandboxNullableStateType,
  M extends SandboxStateType,
> = {
  accepts: N;
  outputs: M;
  transform: (value: SandboxState<N>) => SandboxState<M>;
};

export function createAdapter<
  N extends SandboxNullableStateType,
  M extends SandboxStateType,
>({
  accepts,
  outputs,
  transform,
}: {
  accepts: N;
  outputs: M;
  transform: (value: SandboxState<N>) => SandboxState<M>;
}): SandboxAdapter<N, M> {
  return {
    accepts,
    outputs,
    transform,
  };
}
