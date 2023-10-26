import {
  SandboxAnyAdapter,
  SandboxAnyAlgorithm,
  SandboxAnyProblem,
  SandboxAnyVisualizer,
} from '@types';

export type Box = {
  problem: SandboxAnyProblem;
  problemAlgorithmAdapters: Array<SandboxAnyAdapter>;
  algorithm: SandboxAnyAlgorithm;
  algorithmVisualizerAdapters: Array<SandboxAnyAdapter>;
  visualizer: SandboxAnyVisualizer;
};
