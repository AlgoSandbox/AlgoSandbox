/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxParameterizedAlgorithm,
  SandboxParameterizedProblem,
  SandboxParameterizedVisualizer,
  SandboxProblem,
  SandboxVisualizer,
} from '@algo-sandbox/core';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameterizedAlgorithm<any, any, any>;

export type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameterizedProblem<any, any>;

export type SandboxAnyVisualizer =
  | SandboxVisualizer<any, any>
  | SandboxParameterizedVisualizer<any, any, any>;

export type SandboxAnyAdapter = SandboxAdapter<any, any>;
