import { BoxConfigTree } from '@algo-sandbox/core';
import { compact } from 'lodash';

export default function getUsedSlotsForAlias(
  config: BoxConfigTree,
  alias: string,
) {
  const usedSlots = compact(
    config.composition.connections.map((connection) => {
      if (connection.fromKey === alias) {
        return { type: 'output', slot: connection.fromSlot };
      }

      if (connection.toKey === alias) {
        return { type: 'input', slot: connection.toSlot };
      }

      return null;
    }),
  );

  return usedSlots;
}
