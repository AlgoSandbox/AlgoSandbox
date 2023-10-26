/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameteredProblem,
  SandboxParameteredVisualizer,
  SandboxProblem,
  SandboxVisualizer,
} from '@algo-sandbox/core';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameteredAlgorithm<any, any, any>;

export type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameteredProblem<any, any>;

export type SandboxAnyVisualizer =
  | SandboxVisualizer<any>
  | SandboxParameteredVisualizer<any, any>;

export type SandboxAnyAdapter = SandboxAdapter<any, any>;
