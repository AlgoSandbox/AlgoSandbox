import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { mapValues } from 'lodash';

import getSandboxObjectWithKey from './getSandboxObjectWithKey';
import parseKeyWithParameters from './parseKeyWithParameters';

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
  const { key: problemKey, parameters: problemParameters } =
    parseKeyWithParameters(box.problem);
  const { key: algorithmKey, parameters: algorithmParameters } =
    parseKeyWithParameters(box.algorithm);

  const problem = getSandboxObjectWithKey({
    type: 'problem',
    key: problemKey,
    sandboxComponents,
    files,
  }).mapLeft(() => undefined).value;

  const algorithm = getSandboxObjectWithKey({
    type: 'algorithm',
    key: algorithmKey,
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
    aliases: mapValues(box.visualizers.aliases, (keyWithParameters) => {
      const { key: visualizerKey, parameters } =
        parseKeyWithParameters(keyWithParameters);

      const visualizer = getSandboxObjectWithKey({
        type: 'visualizer',
        key: visualizerKey,
        sandboxComponents,
        files,
      });

      if (visualizer.isLeft()) {
        return undefined;
      }

      return {
        component: visualizer.unwrap(),
        parameters: parameters ?? null,
      };
    }),
    order: box.visualizers.order,
  };

  return {
    problem: problem
      ? {
          component: problem,
          parameters: problemParameters ?? null,
        }
      : undefined,
    algorithm: algorithm
      ? {
          component: algorithm,
          parameters: algorithmParameters ?? null,
        }
      : undefined,
    algorithmVisualizers,
    visualizers,
  };
}
