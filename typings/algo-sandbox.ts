/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxParameterizedAdapter,
  SandboxParameterizedAlgorithm,
  SandboxParameterizedProblem,
  SandboxParameterizedVisualizer,
  SandboxParameters,
  SandboxProblem,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<SandboxStateType, any>
  | SandboxParameterizedAlgorithm<SandboxStateType, any, SandboxParameters>;

export type SandboxAnyProblem =
  | SandboxProblem<SandboxStateType>
  | SandboxParameterizedProblem<SandboxStateType, SandboxParameters>;

export type SandboxAnyVisualizer =
  | SandboxVisualizer<SandboxStateType, any>
  | SandboxParameterizedVisualizer<SandboxStateType, any, SandboxParameters>;

export type SandboxAnyAdapter =
  | SandboxAdapter<SandboxStateType, SandboxStateType>
  | SandboxParameterizedAdapter<
      SandboxStateType,
      SandboxStateType,
      SandboxParameters
    >;
