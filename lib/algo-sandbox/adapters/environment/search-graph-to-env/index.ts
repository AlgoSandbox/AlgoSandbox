import { SandboxAdapter } from '@algo-sandbox/core';
import { sandboxEnvironmentState, searchGraph } from '@algo-sandbox/states';

const searchGraphToEnv: SandboxAdapter<
  typeof searchGraph,
  typeof sandboxEnvironmentState
> = {
  accepts: searchGraph,
  outputs: sandboxEnvironmentState,
  transform: (value) => {
    type State = typeof value & { currentNodeId: string };
    return {
      getInitialState: () => ({
        ...value,
        currentNodeId: value.startId,
      }),
      getStateKey: (state) => state.currentNodeId,
      actions: (state) => {
        if (state.currentNodeId === state.endId) {
          return [];
        }

        if (value.directed) {
          return value.edges
            .filter((edge) => edge.source === state.currentNodeId)
            .map((edge) => edge.target);
        } else {
          const nodes = value.edges
            .filter(
              (edge) =>
                edge.source === state.currentNodeId ||
                edge.target === state.currentNodeId,
            )
            .flatMap((edge) => [edge.source, edge.target]);
          const neighbors = new Set(nodes);
          neighbors.delete(state.currentNodeId);

          return Array.from(neighbors);
        }
      },
      step: (state, action) => {
        const edge = (() => {
          if (value.directed) {
            return (state as State).edges.find(
              (edge) =>
                edge.source === (state as State).currentNodeId &&
                edge.target === action,
            )!;
          } else {
            return (state as State).edges.find(
              (edge) =>
                (edge.source === (state as State).currentNodeId &&
                  edge.target === action) ||
                (edge.target === (state as State).currentNodeId &&
                  edge.source === action),
            )!;
          }
        })();

        return {
          nextState: {
            ...(state as State),
            currentNodeId: action,
          },
          reward: -(edge.weight ?? 1),
          terminated: action === value.endId,
          truncated: false,
          info: {},
        };
      },
      render: (state) => {
        const svg = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg',
        );

        svg.setAttribute('viewBox', '0 0 32 32');

        const label = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text',
        );
        label.innerHTML = (state as State).currentNodeId;
        label.setAttribute('fill', 'rgb(var(--color-on-surface))');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('x', '16');
        label.setAttribute('y', '23');
        label.setAttribute('style', 'pointer-events: none');

        const circle = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle',
        );
        circle.setAttribute('r', '15');
        circle.setAttribute('stroke', 'rgb(var(--color-border))');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('style', 'cursor: grab');
        circle.setAttribute('cx', '16');
        circle.setAttribute('cy', '16');
        circle.setAttribute('fill', 'rgb(var(--color-surface))');

        svg.appendChild(circle);
        svg.appendChild(label);

        return svg;
      },
    };
  },
};

export default searchGraphToEnv;
