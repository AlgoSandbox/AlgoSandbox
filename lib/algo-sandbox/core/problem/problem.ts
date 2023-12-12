import { SandboxState, SandboxStateType } from '../state';

export type SandboxProblem<N extends SandboxStateType> = {
  name: string;
  shape: N;
  initialState: SandboxState<N>;
};
