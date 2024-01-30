import {
  SandboxAdapterOutput,
  SandboxKey,
} from '@algo-sandbox/components/SandboxKey';
import {
  AdapterConfiguration,
  RawAdapterConfiguration,
  SandboxAdapterAliases,
  SandboxKeyFromAlias,
} from '@algo-sandbox/core';

type FlatConfigurationBuilder<
  Aliases extends SandboxAdapterAliases<string, SandboxKey>,
> = {
  connect: <T extends keyof Aliases>(
    key: T,
  ) => FlatConfigurationBuilder<Aliases>;
  build: () => AdapterConfiguration<Aliases>;
};

type TreeAdapterConfigurationBuilder<
  Aliases extends SandboxAdapterAliases<string, SandboxKey>,
> = {
  connect: <F extends keyof Aliases, T extends keyof Aliases>(options: {
    fromKey: F;
    fromSlot: Aliases[F] extends SandboxKey
      ? SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, F>>
      : string;
    toKey: T;
    toSlot: Aliases[T] extends SandboxKey
      ? SandboxAdapterOutput<SandboxKeyFromAlias<Aliases, T>>
      : string;
  }) => TreeAdapterConfigurationBuilder<Aliases>;
  build: () => AdapterConfiguration<Aliases>;
};

type BaseAdapterConfigurationBuilder<
  Aliases extends SandboxAdapterAliases<string, SandboxKey>,
> = {
  tree: () => TreeAdapterConfigurationBuilder<Aliases>;
  flat: () => FlatConfigurationBuilder<Aliases>;
};

export default function buildAdapterConfiguration<
  Aliases extends SandboxAdapterAliases<string, SandboxKey>,
>(adapters: Aliases): BaseAdapterConfigurationBuilder<Aliases> {
  function treeBuilder(
    config: RawAdapterConfiguration<Aliases> & {
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
      build: () => config as AdapterConfiguration<Aliases>,
    };
  }

  function flatBuilder(
    config: RawAdapterConfiguration<Aliases> & {
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
      build: () => config as AdapterConfiguration<Aliases>,
    };
  }

  return {
    tree: () =>
      treeBuilder({
        adapters,
        composition: {
          type: 'tree',
          connections: [],
        },
      }),
    flat: () =>
      flatBuilder({
        adapters,
        composition: {
          type: 'flat',
          order: [],
        },
      }),
  };
}
