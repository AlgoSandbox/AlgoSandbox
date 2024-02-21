import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { ErrorOr, success } from '@app/errors/ErrorContext';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useMemo } from 'react';

import evalBox from './evalBox';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function useDefaultBoxFromFiles(
  files: Record<string, string>,
): ErrorOr<SandboxBoxEvaluated | null> {
  const builtInComponents = useBuiltInComponents();
  return useMemo(() => {
    const defaultBoxFilePath = Object.keys(files).find((path) =>
      path.includes('default-box.ts'),
    );

    if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
      return success(null);
    }

    const defaultBoxCode = files[defaultBoxFilePath];

    if (defaultBoxCode === undefined) {
      return success(null);
    }

    const defaultBox = evalWithAlgoSandbox(defaultBoxCode, {
      files,
      currentFilePath: defaultBoxFilePath,
    }) as ErrorOr<SandboxBox>;

    const evaledBox = defaultBox.map((box) =>
      evalBox({
        box,
        builtInComponents,
        currentFilePath: defaultBoxFilePath,
        files,
      }),
    );

    return evaledBox;
  }, [files, builtInComponents]);
}
