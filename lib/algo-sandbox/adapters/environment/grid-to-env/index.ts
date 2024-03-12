import { createAdapter } from '@algo-sandbox/core';
import { gridWorldState, sandboxEnvironmentState } from '@algo-sandbox/states';
import { z } from 'zod';

type GridWorld = z.infer<(typeof gridWorldState)['shape']>;

type GridWorldAction = {
  type: 'walk';
  to: {
    x: number;
    y: number;
  };
};

function parseAction(action: string): GridWorldAction {
  return JSON.parse(action) as GridWorldAction;
}

function stringifyAction(action: GridWorldAction): string {
  return JSON.stringify(action);
}

const gridWorldToEnv = createAdapter({
  accepts: gridWorldState,
  outputs: sandboxEnvironmentState,
  transform: (value) => {
    return {
      getInitialState: () => {
        return {
          ...value,
        };
      },
      getStateKey: (state) => {
        return JSON.stringify(state);
      },
      actions: (stateAny) => {
        const state = stateAny as GridWorld;
        const agentObject = state.objects.find((obj) => obj.type === 'agent');

        if (agentObject === undefined) {
          return [];
        }

        const { x, y } = agentObject;
        const potentialCoordinates = [
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 },
        ];

        const walls = state.objects.filter((obj) => obj.type === 'wall');
        const wallCoordinates = walls.map((wall) => ({ x: wall.x, y: wall.y }));

        const coordinates = potentialCoordinates.filter((coord) => {
          return !wallCoordinates.some((wallCoord) => {
            return wallCoord.x === coord.x && wallCoord.y === coord.y;
          });
        });

        const actions: Array<GridWorldAction> = coordinates.map((coord) => {
          return {
            type: 'walk',
            to: coord,
          };
        });

        return actions.map(stringifyAction);
      },
      step: (stateAny, actionString) => {
        const state = stateAny as GridWorld;
        const action = parseAction(actionString);

        const newObjects = state.objects.map((obj) => {
          if (obj.type === 'agent') {
            return {
              ...obj,
              x: action.to.x,
              y: action.to.y,
            };
          }
          return obj;
        });

        const newState = {
          ...state,
          objects: newObjects,
        };

        const terminated = state.objects.some((obj) => {
          obj.type === 'goal' && obj.x === action.to.x && obj.y === action.to.y;
        });

        return {
          nextState: newState,
          truncated: false,
          terminated,
          reward: -1,
          info: {},
        };
      },
      render: () => 'placeholder',
    };
  },
});

export default gridWorldToEnv;
