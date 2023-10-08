import { SandboxState, SandboxStateName } from '../state';

export type SandboxProblem<N extends SandboxStateName> = {
  name: string;
  shape: N;
  initialState: SandboxState<N>;
};
