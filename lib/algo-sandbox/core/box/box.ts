import {
  SandboxAdapterKey,
  SandboxAdapterOutput,
  SandboxAlgorithmKey,
  SandboxKey,
  SandboxProblemKey,
  SandboxVisualizerKey,
} from '@algo-sandbox/components/SandboxKey';
import {
  SandboxAnyAdapter,
  SandboxAnyAlgorithm,
  SandboxAnyProblem,
  SandboxAnyVisualizer,
} from '@typings/algo-sandbox';

export type AdapterConnection<
  Aliases extends SandboxAdapterAliases,
  F extends keyof Aliases = keyof Aliases,
  T extends keyof Aliases = keyof Aliases,
> = {
  fromKey: F;
  fromSlot: Aliases[F] extends SandboxKey
    ? SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, F>>
    : string;
  toKey: T;
  toSlot: Aliases[T] extends SandboxKey
    ? SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, T>>
    : string;
};

export type SandboxKeyFromAlias<
  Aliases extends SandboxAdapterAliases,
  Alias extends keyof Aliases,
> = Aliases[Alias] extends SandboxKey ? Aliases[Alias] : SandboxAdapterKey;

type AdapterComposition<Aliases extends SandboxAdapterAliases> =
  | {
      type: 'tree';
      connections: Array<AdapterConnection<Aliases>>;
    }
  | {
      type: 'flat';
      order: Array<keyof Aliases>;
    };

export type SandboxAdapterAliases<
  Alias extends string = string,
  V extends SandboxAnyAdapter | SandboxAdapterKey =
    | SandboxAnyAdapter
    | SandboxAdapterKey,
> = Record<Alias, V>;

export type RawAdapterConfiguration<Aliases extends SandboxAdapterAliases> = {
  adapters: Aliases;
  composition: AdapterComposition<Aliases>;
};

export type AdapterConfiguration<
  Aliases extends SandboxAdapterAliases<
    string,
    SandboxAdapterKey
  > = SandboxAdapterAliases<string, SandboxKey>,
> = RawAdapterConfiguration<Aliases>;
export type AdapterConfigurationEvaluated<
  Aliases extends SandboxAdapterAliases<
    string,
    SandboxAnyAdapter
  > = SandboxAdapterAliases<string, SandboxAnyAdapter>,
> = RawAdapterConfiguration<Aliases>;

export type SandboxBox = {
  problem: SandboxProblemKey;
  problemAlgorithm?: AdapterConfiguration;
  algorithm: SandboxAlgorithmKey;
  algorithmVisualizer?: AdapterConfiguration;
  visualizer: SandboxVisualizerKey;
};

export type SandboxBoxEvaluated = {
  problem?: SandboxAnyProblem;
  problemAlgorithm?: AdapterConfigurationEvaluated;
  algorithm?: SandboxAnyAlgorithm;
  algorithmVisualizer?: AdapterConfigurationEvaluated;
  visualizer?: SandboxAnyVisualizer;
};
