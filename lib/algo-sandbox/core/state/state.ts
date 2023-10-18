import { SandboxStateName, SandboxStateNameMap } from './state-names';

export type SandboxState<N extends SandboxStateName = SandboxStateName> =
  SandboxStateNameMap[N] & {
    _stateName: N;
  };
