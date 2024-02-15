import { SandboxState, SandboxStateType } from '../state';

export type SandboxProblem<T extends SandboxStateType> = {
  name: string;
  type: T;
  getInitialState: () => SandboxState<T>;
};
