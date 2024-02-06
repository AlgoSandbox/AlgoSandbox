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

type StringIfNever<T> = [T] extends [never] ? string : T;

export type AdapterConnection<
  Aliases extends SandboxAliases = SandboxAliases,
  F extends keyof Aliases = keyof Aliases,
  T extends keyof Aliases = keyof Aliases,
> = {
  fromKey: F;
  fromSlot: StringIfNever<
    SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, F>>
  >;
  toKey: T;
  toSlot: StringIfNever<SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, T>>>;
};

export type SandboxKeyFromAlias<
  Aliases extends SandboxAliases,
  Alias extends keyof Aliases,
> = Aliases[Alias] extends SandboxKey ? Aliases[Alias] : SandboxAdapterKey;

export type AdapterCompositionTree<
  Aliases extends SandboxAliases = SandboxAliases,
> = {
  type: 'tree';
  connections: Array<AdapterConnection<Aliases>>;
};

export type AdapterCompositionFlat<
  Aliases extends SandboxAliases = SandboxAliases,
> = {
  type: 'flat';
  order: Array<keyof Aliases>;
};

export type AdapterComposition<
  Aliases extends SandboxAliases = SandboxAliases,
> = AdapterCompositionTree<Aliases> | AdapterCompositionFlat<Aliases>;

export type SandboxAliases<
  Alias extends string = string,
  V extends SandboxAnyAdapter | SandboxKey = SandboxKey,
> = Record<Alias, V>;

export type AdapterConfigurationRaw<Aliases extends SandboxAliases> = {
  aliases: Aliases;
  composition: AdapterComposition<Aliases>;
};

export type AdapterConfigurationFlat<
  Aliases extends SandboxAliases<string, SandboxKey> = SandboxAliases<
    string,
    SandboxKey
  >,
> = AdapterConfigurationRaw<Aliases> & {
  composition: { type: 'flat' };
};

export type AdapterConfigurationTree<
  Aliases extends SandboxAliases<string, SandboxKey> = SandboxAliases<
    string,
    SandboxKey
  >,
> = AdapterConfigurationRaw<Aliases> & {
  composition: { type: 'tree'; connections: Array<AdapterConnection<Aliases>> };
};

export type AdapterConfiguration<
  Aliases extends SandboxAliases<string, SandboxKey> = SandboxAliases<
    string,
    SandboxKey
  >,
> = AdapterConfigurationRaw<Aliases>;

export type AdapterConfigurationEvaluated = {
  aliases: Record<string, SandboxEvaluated<SandboxAnyAdapter> | undefined>;
  composition: AdapterComposition<SandboxAliases<string, SandboxAdapterKey>>;
};

export type SandboxEvaluated<T> = {
  name: string;
  key: string;
  value: T;
};

type AlgorithmVisualizers<
  AdapterAliases extends SandboxAliases<
    string,
    SandboxAdapterKey
  > = SandboxAliases<string, SandboxAdapterKey>,
  VisualizerAliases extends SandboxAliases<
    string,
    SandboxVisualizerKey
  > = SandboxAliases<string, SandboxVisualizerKey>,
> = {
  adapters?: AdapterAliases;
  composition: AdapterComposition<AdapterAliases & VisualizerAliases>;
};

type AlgorithmVisualizersEvaluated = {
  adapters?: Record<string, SandboxAnyAdapter | undefined>;
  composition: AdapterComposition<
    SandboxAliases<string, SandboxVisualizerKey | SandboxAdapterKey>
  >;
};

type Visualizers<
  VisualizerAliases extends SandboxAliases<
    string,
    SandboxVisualizerKey
  > = SandboxAliases<string, SandboxVisualizerKey>,
> = {
  aliases: VisualizerAliases;
  order: Array<keyof VisualizerAliases>;
};

type VisualizersEvaluated = {
  aliases: Record<string, SandboxAnyVisualizer | undefined>;
  order: Array<string>;
};

export type SandboxBox = Readonly<{
  problem: SandboxProblemKey;
  problemAlgorithm?: AdapterConfigurationFlat;
  algorithm: SandboxAlgorithmKey;
  algorithmVisualizers?: AlgorithmVisualizers;
  visualizers: Visualizers;
}>;

export type SandboxBoxEvaluated = {
  problem?: SandboxAnyProblem;
  problemAlgorithm?: AdapterConfigurationEvaluated;
  algorithm?: SandboxAnyAlgorithm;
  algorithmVisualizers?: AlgorithmVisualizersEvaluated;
  visualizers?: VisualizersEvaluated;
};
