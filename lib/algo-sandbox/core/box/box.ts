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

type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameterizedAlgorithm<any, any, any>;

type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameterizedProblem<any, any>;

type SandboxAnyVisualizer =
  | SandboxVisualizer<any>
  | SandboxParameterizedVisualizer<any, any>;

type SandboxAnyAdapter = SandboxAdapter<any, any>;

export type Box = {
  problem: SandboxAnyProblem;
  problemAlgorithmAdapters: Array<SandboxAnyAdapter>;
  algorithm: SandboxAnyAlgorithm;
  algorithmVisualizerAdapters: Array<SandboxAnyAdapter>;
  visualizer: SandboxAnyVisualizer;
};
