import { ErrorOr } from '@app/errors';

import evalWithLibraries from './evalWithLibraries';
import getClientSideOnlyLibraries from './getClientSideOnlyLibraries';
import getLibraries from './getLibraries';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function evalWithAlgoSandbox<T = any>(
  typescriptCode: string,
  options?: {
    fileContext?: {
      files: Record<string, string>;
      currentFilePath: string;
    };
    asModule?: boolean;
  },
): ErrorOr<T> {
  const { fileContext, asModule = false } = options ?? {};
  // Check if calling from server side or web worker, where window is not defined
  // client-side-only libraries will break if they are imported
  const isServerSide = typeof window === 'undefined';

  if (isServerSide) {
    throw new Error(
      'evalWithAlgoSandbox should not be called on the server side. Use evalWithAlgoSandboxServerSide instead.',
    );
  }

  return evalWithLibraries(typescriptCode, {
    fileContext,
    asModule,
    libraries: {
      ...getClientSideOnlyLibraries(),
      ...getLibraries(),
    },
  });
}
