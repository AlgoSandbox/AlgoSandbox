import { ErrorOr } from '@app/errors';

import evalWithLibraries from './evalWithLibraries';
import getLibraries from './getLibraries';

export type EvalWithAlgoSandbox = typeof evalWithAlgoSandboxServerSide;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function evalWithAlgoSandboxServerSide<T = any>(
  typescriptCode: string,
  options?: {
    fileContext?: {
      files: Record<string, string>;
      currentFilePath: string;
    };
    asModule?: boolean;
  },
): ErrorOr<T> {
  return evalWithLibraries(typescriptCode, {
    ...options,
    libraries: getLibraries(),
  });
}
