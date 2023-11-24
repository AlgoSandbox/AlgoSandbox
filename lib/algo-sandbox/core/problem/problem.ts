import { SandboxState, SandboxStateType } from '../state';

export type SandboxProblem<N extends SandboxStateType> = {
  name: string;
  type: N;
  initialState: SandboxState<N>;
};
