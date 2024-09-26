import {
  createParameterizedEnvironment,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import random, { Random } from 'random';
import { z } from 'zod';

const nQueensState = createState(
  'N queens board',
  z.object({
    board: z.array(z.array(z.number())),
  }),
);

// type: z.union([
//   z.tuple([z.literal('visibility_off'), z.literal('unseen')]),
//   z.tuple([z.literal('circle'), z.literal('empty')]),
//   z.tuple([z.literal('vertical_shades_closed'), z.literal('wall')]),
//   z.tuple([z.literal('minimize'), z.literal('floor')]),
//   z.tuple([z.literal('sensor_door'), z.literal('door')]),
//   z.tuple([z.literal('key'), z.literal('key')]),
//   z.tuple([z.literal('sports_soccer'), z.literal('ball')]),
//   z.tuple([z.literal('package_2'), z.literal('ball')]),
//   z.tuple([z.literal('flag'), z.literal('goal')]),
//   z.tuple([z.literal('local_fire_department'), z.literal('goal')]),
//   z.tuple([z.literal('person'), z.literal('agent')]),
// ]),

const DEFAULT_GRID_SIZE = 8;
const nQueensEnvironmentParameterized = createParameterizedEnvironment({
  name: 'N-Queens Board',
  initialStateType: nQueensState,
  actionsType: z.string(),
  parameters: {
    grid: SandboxParam.newGrid('grid', [
      Array.from({ length: DEFAULT_GRID_SIZE }, () =>
        Array.from({ length: DEFAULT_GRID_SIZE }, () => []),
      ),
      [['chess', 'queen']], // [mui icon name, label]
    ]),
    gridSize: SandboxParam.integer('Grid size (n)', DEFAULT_GRID_SIZE),
    seed: SandboxParam.string('Seed', ''),
  },
  getStateKey: ({ board }) => JSON.stringify(board),
  getInitialState: ({ gridSize, seed }) => {
    // randomly generate gridSize number of queens on nQueensBoard, 1 on each column
    // todo: should probably get from parameters
    let rand;
    if (seed !== '') {
      rand = random.clone(seed);
    } else {
      rand = new Random();
    }

    const board = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => 0),
    );
    for (let j = 0; j < gridSize; j++) {
      board[rand.int(0, gridSize - 1)][j] = 1;
    }

    return {
      board,
    };
  },
  step: (state, action, { gridSize }) => {
    // transition the queen in column col to row newRow
    const [newRow, col] = action.split(',').map(Number);

    // penalise not moving queen
    const oldRow = Array.from({ length: gridSize }, (_, i) => i).reduce(
      (queenRow: number, i) =>
        queenRow !== -1 ? queenRow : state.board[i][col] ? i : -1,
      -1,
    );
    if (oldRow === -1) {
      throw new Error('Invalid board state');
    }
    if (oldRow === newRow) {
      return {
        nextState: state,
        reward: -1,
        terminated: false,
        truncated: false,
        info: {},
      };
    }

    const newBoard = [...state.board];
    newBoard[oldRow][col] = 0;
    newBoard[newRow][col] = 1;

    const oldStateScore = getStateScore(state.board);
    const newStateScore = getStateScore(newBoard);
    const reward = newStateScore - oldStateScore;
    const terminated = newStateScore === gridSize;

    return {
      nextState: { board: newBoard },
      reward,
      terminated,
      truncated: false,
      info: {},
    };
  },
  actions: (_, { gridSize }) => {
    // an action is moving a queen from [i1, j] to [i2, j]
    // endPositions denote all the possible [i2, j] positions after moving a queen from [i1, j]
    // if we allow i2 == i1, i.e. a valid action is not moving the queen at all
    // then endPositions would basically be all the possible coordinates in the grid
    const actions: Array<string> = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        actions.push(`${i},${j}`);
      }
    }
    return actions;
  },
  render: () => {
    // TODO: Render n queens board
    const board = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');
    rect.setAttribute('fill', 'red');

    board.appendChild(rect);
    board.setAttribute('viewBox', '0 0 100 100');

    return board;
  },
});

// const nQueensEnvironmentParameterized = createParameterizedEnvironment({
//   name: 'N-Queens (environment)',
//   initialStateType: nQueensState,
//   actionsType: z.string(),
//   parameters: {
//     board: SandboxParam.arrayNumber2D(
//       'Board',
//       Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 0)),
//     ),
//     boardSize: SandboxParam.integer('Board size (n)', 8),
//     seed: SandboxParam.string('Seed', ''),
//   },
//   getStateKey: (state) => JSON.stringify(state.board),
//   getInitialState: ({ boardSize, seed }) => {
//     const board = Array.from({ length: boardSize }, () =>
//       Array.from({ length: boardSize }, () => 0),
//     );

//     if (seed !== '') {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       random.use(seed as any);
//     } else {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       random.use(Math.random as any);
//     }

//     for (let col = 0; col < boardSize; col++) {
//       board[random.integer(0, boardSize - 1)][col] = 1;
//     }

//     return {
//       board,
//     };
//   },
//   step: (state, action, { boardSize }) => {
//     const [col, newRow] = action.split(',').map(Number);

//     // If invalid state, return -1 reward
//     if (state.board[newRow][col] === 1) {
//       return {
//         nextState: state,
//         reward: -1,
//         terminated: false,
//         truncated: false,
//         info: {},
//       };
//     }

//     const newBoard = [...state.board.map((row) => [...row])];
//     const oldRow = (() => {
//       for (let i = 0; i < boardSize; i++) {
//         if (newBoard[i][col] === 1) {
//           return i;
//         }
//       }
//       throw new Error('Invalid board state');
//     })();

//     // Update queen positions
//     newBoard[oldRow][col] = 0;
//     newBoard[newRow][col] = 1;

//     // Check for successful placement (no conflicts)
//     const newStateScore = getStateScore(newBoard);
//     const reward = newStateScore - getStateScore(state.board);
//     const terminated = newStateScore === boardSize;

//     return {
//       nextState: { board: newBoard },
//       reward,
//       terminated,
//       truncated: false,
//       info: {},
//     };
//   },
//   actions: (_, { boardSize }) => {
//     const actions: Array<[number, number]> = [];
//     for (let row = 0; row < boardSize; row++) {
//       for (let col = 0; col < boardSize; col++) {
//         actions.push([col, row]);
//       }
//     }
//     return actions.map(([col, row]) => `${col},${row}`);
//   },
//   render: () => {
//     // TODO: Render n queens board
//     const board = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

//     const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
//     rect.setAttribute('x', '0');
//     rect.setAttribute('y', '0');
//     rect.setAttribute('width', '100');
//     rect.setAttribute('height', '100');
//     rect.setAttribute('fill', 'red');

//     board.appendChild(rect);
//     board.setAttribute('viewBox', '0 0 100 100');

//     return board;
//   },
// });

// checks if queen's row and diagonal has another queen
// assumes that queen's column only has 1 queen
function isQueenWellPositioned(
  board: Array<Array<number>>,
  row: number,
  col: number,
) {
  for (let i = 0; i < board.length; i++) {
    if (board[row][i] === 1 && i !== col) {
      return false;
    }
    if (board[i][col] === 1 && i !== row) {
      return false;
    }
  }
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (i + j === row + col || i - j === row - col) {
        if (board[i][j] === 1 && !(i === row && j === col)) {
          return false;
        }
      }
    }
  }
  return true;
}

// Return the number of queens that are not attacking each other
function getStateScore(board: Array<Array<number>>) {
  let score = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] === 1) {
        const isWellPositioned = isQueenWellPositioned(board, i, j);
        score += isWellPositioned ? 1 : 0;
      }
    }
  }
  return score;
}

export default nQueensEnvironmentParameterized;
