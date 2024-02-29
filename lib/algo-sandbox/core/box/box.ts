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
> = Aliases[Alias] extends SandboxKeyWithParameters<SandboxKey>
  ? ExtractKey<Aliases[Alias]>
  : SandboxAdapterKey;

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
  V extends
    SandboxKeyWithParameters<SandboxKey> = SandboxKeyWithParameters<SandboxKey>,
> = Record<Alias, V>;

export type AdapterConfigurationRaw<
  Aliases extends SandboxAliases<
    string,
    SandboxKeyWithParameters<SandboxAdapterKey>
  >,
> = {
  aliases: Aliases;
  composition: AdapterComposition<Aliases>;
};

export type AdapterConfigurationFlat<
  Aliases extends SandboxAliases<
    string,
    SandboxKeyWithParameters<SandboxKey>
  > = SandboxAliases<string, SandboxKeyWithParameters<SandboxKey>>,
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
  Aliases extends SandboxAliases<
    string,
    SandboxKeyWithParameters<SandboxKey>
  > = SandboxAliases<string, SandboxKeyWithParameters<SandboxKey>>,
> = AdapterConfigurationRaw<Aliases>;

export type AdapterConfigurationEvaluated = {
  aliases: Record<
    string,
    SandboxEvaluated<ComponentWithParameters<SandboxAnyAdapter>> | undefined
  >;
  composition: AdapterComposition<SandboxAliases<string, SandboxAdapterKey>>;
};

export type SandboxEvaluated<T> = {
  name: string;
  key: string;
  value: T;
};

export type BoxConfig<
  AdapterAliases extends SandboxAliases<
    string,
    SandboxKeyWithParameters<SandboxAdapterKey>
  > = SandboxAliases<string, SandboxKeyWithParameters<SandboxAdapterKey>>,
  VisualizerAliases extends SandboxAliases<
    string,
    SandboxKeyWithParameters<SandboxVisualizerKey>
  > = SandboxAliases<string, SandboxKeyWithParameters<SandboxVisualizerKey>>,
> = {
  adapters?: AdapterAliases;
  composition: AdapterComposition<AdapterAliases | VisualizerAliases>;
};

export type BoxConfigTree = BoxConfig & {
  composition: {
    type: 'tree';
  };
};

export type BoxConfigEvaluated = {
  adapters?: Record<
    string,
    SandboxEvaluated<ComponentWithParameters<SandboxAnyAdapter>> | undefined
  >;
  composition: AdapterComposition<
    SandboxAliases<string, SandboxVisualizerKey | SandboxAdapterKey>
  >;
};

type Visualizers<
  VisualizerAliases extends SandboxAliases<
    string,
    SandboxKeyWithParameters<SandboxVisualizerKey>
  > = SandboxAliases<string, SandboxKeyWithParameters<SandboxVisualizerKey>>,
> = {
  aliases: VisualizerAliases;
  order: Array<keyof VisualizerAliases>;
};

type VisualizersEvaluated = {
  aliases: Record<
    string,
    ComponentWithParameters<SandboxAnyVisualizer> | undefined
  >;
  order: Array<string>;
};

export type SandboxKeyWithParameters<T extends SandboxKey> =
  | T
  | {
      key: T;
      parameters: Record<string, unknown>;
    };

type ExtractKey<K> = K extends { key: infer T } ? T : K;

export type SandboxBox = Readonly<{
  problem: SandboxKeyWithParameters<SandboxProblemKey>;
  algorithm: SandboxKeyWithParameters<SandboxAlgorithmKey>;
  visualizers: Visualizers;
  config?: BoxConfig;
}>;

type ComponentWithParameters<T> = {
  component: T;
  parameters: Record<string, unknown> | null;
};

export type SandboxBoxEvaluated = {
  problem?: ComponentWithParameters<SandboxAnyProblem>;
  algorithm?: ComponentWithParameters<SandboxAnyAlgorithm>;
  visualizers?: VisualizersEvaluated;
  config?: BoxConfigEvaluated;
};
