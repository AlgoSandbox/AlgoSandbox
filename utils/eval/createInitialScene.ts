import { SandboxBox } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import convertBoxConfigToTree from '@utils/convertBoxConfigToTree';
import { createScene } from '@utils/scene';
import solveFlowchart from '@utils/solveFlowchart';
import { mapValues } from 'lodash';

import evalBoxImpl from './evalBoxImpl';
import evalWithAlgoSandboxServerSide from '../../lib/algo-sandbox/utils/evalWithAlgoSandboxServerSide';

export default function createInitialScene({
  box,
  sandboxComponents,
  files,
}: {
  box: SandboxBox | null;
  sandboxComponents: SandboxComponents;
  files?: Record<string, string>;
}) {
  const boxEvaluated = (() => {
    if (box === null) {
      return null;
    }

    return evalBoxImpl({
      box,
      sandboxComponents,
      files: files ?? {},
      currentFilePath: '',
      evalFn: evalWithAlgoSandboxServerSide,
    });
  })();

  const algorithmInput = (() => {
    if (box === null || boxEvaluated === null) {
      return null;
    }

    const visualizerAliases = Object.keys(box.visualizers.aliases);
    const configTree = convertBoxConfigToTree(
      box.config ?? {
        composition: { type: 'flat', order: [] },
        adapters: {},
      },
      visualizerAliases,
    );
    const configAdapterInstances = mapValues(
      boxEvaluated.config?.adapters ?? {},
      (evaluation) => {
        if (evaluation === undefined) {
          return undefined;
        }
        const { component: adapter, parameters } = evaluation;

        const instance =
          'parameters' in adapter
            ? adapter.create(parameters ?? undefined)
            : adapter;

        return instance;
      },
    );
    // const configVisualizerInstances = mapValues(
    //   boxEvaluated.visualizers?.aliases ?? {},
    //   (evaluation) => {
    //     if (evaluation === undefined) {
    //       return undefined;
    //     }
    //     const { component: visualizer, parameters } = evaluation;

    //     const instance =
    //       'parameters' in visualizer
    //         ? visualizer.create(parameters ?? undefined)
    //         : visualizer;

    //     return instance;
    //   },
    // );

    const problemInstance = (() => {
      if (boxEvaluated.problem === undefined) {
        return null;
      }

      const { component: problem, parameters } = boxEvaluated.problem;

      const instance =
        'parameters' in problem
          ? problem.create(parameters ?? undefined)
          : problem;

      return instance;
    })();

    const problemState =
      problemInstance !== null ? problemInstance.getInitialState() : undefined;

    const { inputs } = solveFlowchart({
      config: configTree,
      problemState,
      adapters: configAdapterInstances ?? {},
      visualizers: {}, //configVisualizerInstances,
    });

    return inputs['algorithm'];
  })();

  const algorithmInstance = (() => {
    if (boxEvaluated?.algorithm === undefined) {
      return null;
    }

    const { component: algorithm, parameters } = boxEvaluated.algorithm;

    const instance =
      'parameters' in algorithm
        ? algorithm.create(parameters ?? undefined)
        : algorithm;

    return instance;
  })();

  if (algorithmInstance === null || algorithmInput === null) {
    return null;
  }

  const parseResult = algorithmInstance.accepts.shape.safeParse(algorithmInput);

  if (!parseResult.success) {
    return null;
  }

  const scene = createScene({
    algorithm: algorithmInstance,
    algorithmInput,
  });

  return scene
    .copyWithExecution({
      untilCount: 1,
      maxExecutionStepCount: 1,
      updateCount: 1,
    })
    .next().value;
}
