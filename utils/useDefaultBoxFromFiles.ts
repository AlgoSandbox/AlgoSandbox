import { SandboxBox } from '@algo-sandbox/core';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { useMemo } from 'react';

import evalBox from './evalBox';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function useDefaultBoxFromFiles(files: Record<string, string>) {
  const builtInComponents = useBuiltInComponents();
  return useMemo(() => {
    const defaultBoxFilePath = Object.keys(files).find((path) =>
      path.includes('default-box.ts'),
    );

    if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
      return;
    }

    const defaultBoxCode = files[defaultBoxFilePath];

    if (defaultBoxCode === undefined) {
      return;
    }

    const defaultBox = evalWithAlgoSandbox(defaultBoxCode, {
      files,
      currentFilePath: defaultBoxFilePath,
    }) as SandboxBox;

    const evaledBox = evalBox({
      box: defaultBox,
      builtInComponents,
      currentFilePath: defaultBoxFilePath,
      files,
    });

    return evaledBox;
  }, [files, builtInComponents]);
}
