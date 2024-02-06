import {
  SandboxAdapterInput,
  SandboxAdapterOutput,
  SandboxKey,
} from '@algo-sandbox/components/SandboxKey';
import {
  AdapterConfigurationFlat,
  AdapterConfigurationRaw,
  SandboxAliases,
  SandboxKeyFromAlias,
  AdapterConfigurationTree,
} from '@algo-sandbox/core';

type FlatConfigurationBuilder<
  Aliases extends SandboxAliases<string, SandboxKey>,
> = {
  connect: <T extends keyof Aliases>(
    key: T,
  ) => FlatConfigurationBuilder<Aliases>;
  build: () => AdapterConfigurationFlat<Aliases>;
};

type StringIfNever<T> = [T] extends [never] ? string : T;

type TreeAdapterConfigurationBuilder<
  Aliases extends SandboxAliases<string, SandboxKey>,
> = {
  connect: <F extends keyof Aliases, T extends keyof Aliases>(options: {
    fromKey: F;
    fromSlot: StringIfNever<
      SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, F>>
    >;
    toKey: T;
    toSlot: StringIfNever<SandboxAdapterInput<SandboxKeyFromAlias<Aliases, T>>>;
  }) => TreeAdapterConfigurationBuilder<Aliases>;
  build: () => AdapterConfigurationTree<Aliases>;
};

type BaseAdapterConfigurationBuilder<
  Aliases extends SandboxAliases<string, SandboxKey>,
> = {
  tree: () => TreeAdapterConfigurationBuilder<Aliases>;
  flat: () => FlatConfigurationBuilder<Aliases>;
};

export default function buildAdapterConfiguration<
  Aliases extends SandboxAliases<string, SandboxKey>,
>(adapters: Aliases): BaseAdapterConfigurationBuilder<Aliases> {
  function treeBuilder(
    config: AdapterConfigurationRaw<Aliases> & {
      composition: { type: 'tree' };
    },
  ): TreeAdapterConfigurationBuilder<Aliases> {
    return {
      connect: (options) => {
        return treeBuilder({
          ...config,
          composition: {
            type: 'tree',
            connections: [...config.composition.connections, options],
          },
        });
      },
      build: () => config,
    };
  }

  function flatBuilder(
    config: AdapterConfigurationRaw<Aliases> & {
      composition: { type: 'flat' };
    },
  ): FlatConfigurationBuilder<Aliases> {
    return {
      connect: (key) => {
        return flatBuilder({
          ...config,
          composition: {
            type: 'flat',
            order: [...config.composition.order, key],
          },
        });
      },
      build: () => config,
    };
  }

  return {
    tree: () =>
      treeBuilder({
        aliases: adapters,
        composition: {
          type: 'tree',
          connections: [],
        },
      }),
    flat: () =>
      flatBuilder({
        aliases: adapters,
        composition: {
          type: 'flat',
          order: [],
        },
      }),
  };
}
