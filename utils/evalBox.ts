import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { BuiltInComponents } from '@components/playground/BuiltInComponentsProvider';

import getSandboxObjectWithKey from './getSandboxObjectWithKey';

export default function evalBox({
  box,
  builtInComponents,
  files,
}: {
  box: SandboxBox;
  currentFilePath: string;
  files: Record<string, string>;
  builtInComponents: BuiltInComponents;
}): SandboxBoxEvaluated {
  const algorithm =
    getSandboxObjectWithKey({
      type: 'algorithm',
      key: box.algorithm,
      builtInComponents,
      files,
    }) ?? undefined;
  const problem =
    getSandboxObjectWithKey({
      type: 'problem',
      key: box.problem,
      builtInComponents,
      files,
    }) ?? undefined;
  const visualizer =
    getSandboxObjectWithKey({
      type: 'visualizer',
      // TODO: change this
      key:
        box.visualizers.aliases['visualizer-0'] ??
        'visualizer.graphs.searchGraph',
      builtInComponents,
      files,
    }) ?? undefined;

  const algorithmVisualizers: SandboxBoxEvaluated['algorithmVisualizers'] = {
    composition: box.algorithmVisualizers.composition,
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
