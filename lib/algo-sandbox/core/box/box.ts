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

type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameteredAlgorithm<any, any, any>;

type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameteredProblem<any, any>;

type SandboxAnyVisualizer =
  | SandboxVisualizer<any>
  | SandboxParameteredVisualizer<any, any>;

type SandboxAnyAdapter = SandboxAdapter<any, any>;

export type Box = {
  problem: SandboxAnyProblem;
  problemAlgorithmAdapters: Array<SandboxAnyAdapter>;
  algorithm: SandboxAnyAlgorithm;
  algorithmVisualizerAdapters: Array<SandboxAnyAdapter>;
  visualizer: SandboxAnyVisualizer;
};
