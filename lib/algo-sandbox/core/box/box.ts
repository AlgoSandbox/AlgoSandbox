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
  Aliases extends SandboxAliases,
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

type AdapterComposition<Aliases extends SandboxAliases> =
  | {
      type: 'tree';
      connections: Array<AdapterConnection<Aliases>>;
    }
  | {
      type: 'flat';
      order: Array<keyof Aliases>;
    };

export type SandboxAliases<
  Alias extends string = string,
  V extends SandboxAnyAdapter | SandboxKey = SandboxAnyAdapter | SandboxKey,
> = Record<Alias, V>;

export type RawAdapterConfiguration<Aliases extends SandboxAliases> = {
  aliases: Aliases;
  composition: AdapterComposition<Aliases>;
};

export type FlatAdapterConfiguration<
  Aliases extends SandboxAliases<string, SandboxKey> = SandboxAliases<
    string,
    SandboxKey
  >,
> = RawAdapterConfiguration<Aliases> & {
  composition: { type: 'flat' };
};

export type TreeAdapterConfiguration<
  Aliases extends SandboxAliases<string, SandboxKey> = SandboxAliases<
    string,
    SandboxKey
  >,
> = RawAdapterConfiguration<Aliases> & {
  composition: { type: 'tree'; connections: Array<AdapterConnection<Aliases>> };
};

export type AdapterConfiguration<
  Aliases extends SandboxAliases<string, SandboxKey> = SandboxAliases<
    string,
    SandboxKey
  >,
> = RawAdapterConfiguration<Aliases>;
export type AdapterConfigurationEvaluated<
  Aliases extends SandboxAliases<string, SandboxAnyAdapter> = SandboxAliases<
    string,
    SandboxAnyAdapter
  >,
> = RawAdapterConfiguration<Aliases>;

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
  problemAlgorithm?: AdapterConfiguration;
  algorithm: SandboxAlgorithmKey;
  algorithmVisualizers: AlgorithmVisualizers;
  visualizers: Visualizers;
}>;

export type SandboxBoxEvaluated = {
  problem?: SandboxAnyProblem;
  problemAlgorithm?: AdapterConfigurationEvaluated;
  algorithm?: SandboxAnyAlgorithm;
  algorithmVisualizers?: AlgorithmVisualizersEvaluated;
  visualizers?: VisualizersEvaluated;
};
