import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';

import getSandboxObjectWithKey from './getSandboxObjectWithKey';

export default function evalBox({
  box,
  sandboxComponents,
  files,
}: {
  box: SandboxBox;
  currentFilePath: string;
  files: Record<string, string>;
  sandboxComponents: SandboxComponents;
}): SandboxBoxEvaluated {
  const algorithm = getSandboxObjectWithKey({
    type: 'algorithm',
    key: box.algorithm,
    sandboxComponents,
    files,
  }).mapLeft(() => undefined).value;
  const problem = getSandboxObjectWithKey({
    type: 'problem',
    key: box.problem,
    sandboxComponents,
    files,
  }).mapLeft(() => undefined).value;
  const visualizer = getSandboxObjectWithKey({
    type: 'visualizer',
    // TODO: change this
    key:
      box.visualizers.aliases['visualizer-0'] ??
      'visualizer.graphs.searchGraph',
    sandboxComponents,
    files,
  }).mapLeft(() => undefined).value;

  const algorithmVisualizers: SandboxBoxEvaluated['algorithmVisualizers'] = {
    composition: box.algorithmVisualizers?.composition ?? {
      type: 'flat',
      order: [],
    },
  };

  const visualizers: SandboxBoxEvaluated['visualizers'] = {
    aliases: {
      'visualizer-0': visualizer,
    },
    order: box.visualizers.order,
  };

  return {
    problem,
    algorithm,
    algorithmVisualizers,
    visualizers,
  };
}
