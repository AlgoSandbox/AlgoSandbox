import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';

import evalBoxImpl from './evalBoxImpl';
import evalWithAlgoSandbox from './evalWithAlgoSandbox';

export default function evalBox(options: {
  box: SandboxBox;
  currentFilePath: string;
  files: Record<string, string>;
  sandboxComponents: SandboxComponents;
}): SandboxBoxEvaluated {
  return evalBoxImpl({ ...options, evalFn: evalWithAlgoSandbox });
}
