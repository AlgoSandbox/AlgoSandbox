import { BoxConfig, BoxConfigTree } from '@algo-sandbox/core';
import { compact } from 'lodash';

export default function convertBoxConfigToTree(
  boxConfig: BoxConfig,
  visualizerAliases: Array<string>,
): BoxConfigTree {
  const type = boxConfig.composition.type;
  if (type === 'tree') {
    return boxConfig as BoxConfigTree;
  } else {
    // Try to generate edges between algorithm -> adapter 1 -> adapter 2 -> visualizer/s
    const orderedAdapterAliases = boxConfig.composition.order;
    const orderedNodeAliases = ['algorithm', ...orderedAdapterAliases];
    const lastNode = orderedNodeAliases[orderedNodeAliases.length - 1];

    const nodeConnections = compact(
      orderedNodeAliases.map((alias, index) => {
        if (alias === 'algorithm' || alias === 'problem') {
          return null;
        }

        const previousAlias = orderedNodeAliases[index - 1];
        return {
          fromKey: previousAlias,
          fromSlot: '.',
          toKey: alias,
          toSlot: '.',
        };
      }),
    );

    const visualizerConnections = visualizerAliases.map((visualizerAlias) => {
      return {
        fromKey: lastNode,
        fromSlot: '.',
        toKey: visualizerAlias,
        toSlot: '.',
      };
    });

    const convertedConfiguration: BoxConfigTree = {
      adapters: boxConfig.adapters ?? {},
      composition: {
        type: 'tree',
        connections: [...nodeConnections, ...visualizerConnections],
      },
    };
    return convertedConfiguration;
  }
}
