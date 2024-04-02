import {
  createParameterizedEnvironment,
  createState,
  SandboxParam,
} from '@algo-sandbox/core';
import { SVG } from '@svgdotjs/svg.js';
import { z } from 'zod';

const nQueensState = createState(
  'N queens board',
  z.object({
    board: z.array(z.array(z.number())),
  }),
);

const nQueensEnvironmentParameterized = createParameterizedEnvironment({
  name: 'N-Queens (environment)',
  initialStateType: nQueensState,
  actionsType: z.string(),
  parameters: {
    boardSize: SandboxParam.integer('Board size (n)', 8),
  },
  getStateKey: (state) => JSON.stringify(state.board),
  getInitialState: ({ boardSize }) => {
    const board = Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => 0),
    );

    for (let col = 0; col < boardSize; col++) {
      board[0][col] = 1;
    }

    return {
      board,
    };
  },
  step: (state, action, { boardSize }) => {
    const [col, newRow] = action.split(',').map(Number);

    // If invalid state, return -1 reward
    if (state.board[newRow][col] === 1) {
      return {
        nextState: state,
        reward: -1,
        terminated: false,
        truncated: false,
        info: {},
      };
    }

    const newBoard = [...state.board.map((row) => [...row])];
    const oldRow = (() => {
      for (let i = 0; i < boardSize; i++) {
        if (newBoard[i][col] === 1) {
          return i;
        }
      }
      throw new Error('Invalid board state');
    })();

    // Update queen positions
    newBoard[oldRow][col] = 0;
    newBoard[newRow][col] = 1;

    // Check for successful placement (no conflicts)
    const newStateScore = getStateScore(newBoard);
    const reward = newStateScore - getStateScore(state.board);
    const terminated = newStateScore === boardSize;

    return {
      nextState: { board: newBoard },
      reward,
      terminated,
      truncated: false,
      info: {},
    };
  },
  actions: (_, { boardSize }) => {
    const actions: Array<[number, number]> = [];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        actions.push([col, row]);
      }
    }
    return actions.map(([col, row]) => `${col},${row}`);
  },
  render: () => {
    // TODO: Render n queens board
    return SVG().rect(100, 100).fill('red');
  },
});

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
