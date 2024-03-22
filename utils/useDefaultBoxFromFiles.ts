import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { ErrorOr, success } from '@app/errors';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useMemo } from 'react';

import evalBox from './eval/evalBox';
import evalWithAlgoSandbox from './eval/evalWithAlgoSandbox';

export default function useDefaultBoxFromFiles(
  files: Record<string, string>,
): ErrorOr<SandboxBoxEvaluated | null> {
  const sandboxComponents = useSandboxComponents();
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
      fileContext: {
        files,
        currentFilePath: defaultBoxFilePath,
      },
    }) as ErrorOr<SandboxBox>;

    const evaledBox = defaultBox.map((box) =>
      evalBox({
        box,
        sandboxComponents: sandboxComponents,
        currentFilePath: defaultBoxFilePath,
        files,
      }),
    );

    return evaledBox;
  }, [files, sandboxComponents]);
}
