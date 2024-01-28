import {
  SandboxAlgorithmKey,
  SandboxProblemKey,
  SandboxVisualizerKey,
} from '@algo-sandbox/components/SandboxKey';
import {
  SandboxAnyAdapter,
  SandboxAnyAlgorithm,
  SandboxAnyProblem,
  SandboxAnyVisualizer,
} from '@typings/algo-sandbox';

type AdapterComposition<A extends string> =
  | {
      type: 'tree';
      connections: Array<{
        fromKey: A;
        fromSlot: string;
        toKey: A;
        toSlot: string;
      }>;
    }
  | {
      type: 'flat';
      order: Array<A>;
    };

type AdapterConfiguration<
  A extends string,
  V extends SandboxAnyAdapter | SandboxKey,
> = {
  adapters: Record<A, V>;
  composition: AdapterComposition<A>;
};

export type SandboxBox = {
  problem: SandboxProblemKey;
  problemAlgorithm?: AdapterConfiguration<string, SandboxAnyAdapter>;
  algorithm: SandboxAlgorithmKey;
  algorithmVisualizer?: AdapterConfiguration<string, SandboxAnyAdapter>;
  visualizer: SandboxVisualizerKey;
};

type SandboxKey = string;

export type SandboxBoxEvaluated = {
  problem?: SandboxAnyProblem;
  problemAlgorithm?: AdapterConfiguration<string, SandboxAnyAdapter>;
  algorithm?: SandboxAnyAlgorithm;
  algorithmVisualizer?: AdapterConfiguration<string, SandboxAnyAdapter>;
  visualizer?: SandboxAnyVisualizer;
};
