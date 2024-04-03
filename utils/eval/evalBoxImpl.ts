import { SandboxBox, SandboxBoxEvaluated } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { mapValues } from 'lodash';

import getSandboxObjectWithKeyImpl from '../getSandboxObjectWithKeyImpl';
import parseKeyWithParameters from '../parseKeyWithParameters';
import { EvalWithAlgoSandbox } from '../../lib/algo-sandbox/utils/evalWithAlgoSandboxServerSide';

export default function evalBoxImpl({
  box,
  sandboxComponents,
  files,
  evalFn,
}: {
  box: SandboxBox;
  currentFilePath: string;
  files: Record<string, string>;
  sandboxComponents: SandboxComponents;
  evalFn: EvalWithAlgoSandbox;
}): SandboxBoxEvaluated {
  const { key: problemKey, parameters: problemParameters } =
    parseKeyWithParameters(box.problem);
  const { key: algorithmKey, parameters: algorithmParameters } =
    parseKeyWithParameters(box.algorithm);

  const problem = getSandboxObjectWithKeyImpl({
    type: 'problem',
    key: problemKey,
    sandboxComponents,
    files,
    evalFn,
  }).mapLeft(() => undefined).value;

  const algorithm = getSandboxObjectWithKeyImpl({
    type: 'algorithm',
    key: algorithmKey,
    sandboxComponents,
    files,
    evalFn,
  }).mapLeft(() => undefined).value;

  const configAdapters = box.config?.adapters;

  const config: SandboxBoxEvaluated['config'] = {
    adapters: configAdapters
      ? mapValues(configAdapters, (keyWithParameters) => {
          const { key: adapterKey, parameters } =
            parseKeyWithParameters(keyWithParameters);

          const adapter = getSandboxObjectWithKeyImpl({
            type: 'adapter',
            key: adapterKey,
            sandboxComponents,
            files,
            evalFn,
          });

          if (adapter.isLeft()) {
            return undefined;
          }

          return {
            component: adapter.unwrap(),
            parameters: parameters ?? null,
          };
        })
      : undefined,
    composition: box.config?.composition ?? {
      type: 'flat',
      order: [],
    },
  };

  const visualizers: SandboxBoxEvaluated['visualizers'] = {
    aliases: mapValues(box.visualizers.aliases, (keyWithParameters) => {
      const { key: visualizerKey, parameters } =
        parseKeyWithParameters(keyWithParameters);

      const visualizer = getSandboxObjectWithKeyImpl({
        type: 'visualizer',
        key: visualizerKey,
        sandboxComponents,
        files,
        evalFn,
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
    config: config,
    visualizers,
  };
}
