import { SandboxStateNameMap } from './state-names';

export type SandboxState<N extends keyof SandboxStateNameMap = any> =
  SandboxStateNameMap[N] & {
    _stateName: N;
  };
