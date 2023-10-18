/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameteredProblem,
  SandboxParameteredVisualizer,
  SandboxParameters,
  SandboxProblem,
  SandboxStateName,
  SandboxVisualizer,
} from '@algo-sandbox/core';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<SandboxStateName, SandboxStateName>
  | SandboxParameteredAlgorithm<SandboxStateName, SandboxStateName, any>;

export type SandboxAnyProblem =
  | SandboxProblem<SandboxStateName>
  | SandboxParameteredProblem<SandboxStateName, SandboxParameters>;

export type SandboxAnyVisualizer =
  | SandboxVisualizer<any>
  | SandboxParameteredVisualizer<any, any>;
