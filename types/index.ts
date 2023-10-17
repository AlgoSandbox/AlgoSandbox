import {
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameteredProblem,
  SandboxProblem,
} from '@algo-sandbox/core';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameteredAlgorithm<any, any, any>;

export type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameteredProblem<any, any>;
