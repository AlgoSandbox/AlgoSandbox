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
