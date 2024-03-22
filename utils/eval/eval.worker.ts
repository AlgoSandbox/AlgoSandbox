// NOTE: This file is a Web Worker script.
// IT CANNOT IMPORT ANY FILES THAT REQUIRE BROWSER ENVIRONMENT.
// LIBRARIES LIKE D3, REACT, REACT_DOM CANNOT BE IMPORTED HERE.
// MAKE SURE THAT ALL IMPORTS DON'T THEMSELVES IMPORT THESE
// EVEN UNUSED IMPORTS WILL CAUSE THIS TO BREAK

import { SandboxBox, SandboxStateType } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import convertBoxConfigToTree from '@utils/convertBoxConfigToTree';
import { serializeJson } from '@utils/json-serializer';
import { createScene, SandboxScene } from '@utils/scene';
import solveFlowchart from '@utils/solveFlowchart';
import { mapValues } from 'lodash';

import evalBoxImpl from './evalBoxImpl';
import evalWithAlgoSandboxServerSide from './evalWithAlgoSandboxServerSide';

export type EvalWorkerArgs =
  | {
      action: 'initialize';
      data: {
        box: SandboxBox | null;
        sandboxComponents: SandboxComponents;
      };
    }
  | {
      action: 'execute';
      data: {
        untilCount?: number;
      };
    };

export type EvalWorkerResponse = {
  scene: string | null;
};

function postScene(
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null,
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { copyWithExecution: _, ...readonlyScene } = scene ?? {};

  const response: EvalWorkerResponse = {
    scene: scene ? serializeJson(readonlyScene) : null,
  };

  postMessage(response);
}

{
  let scene: SandboxScene<SandboxStateType, SandboxStateType> | null = null;

  self.onmessage = async (event: MessageEvent<EvalWorkerArgs>) => {
    const { action, data } = event.data;

    // simulate expensive operation

    if (action === 'initialize') {
      scene = null;
      const { box, sandboxComponents } = data;

      const boxEvaluated = (() => {
        if (box === null) {
          return null;
        }

        return evalBoxImpl({
          box,
          sandboxComponents,
          files: {},
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
          problemInstance !== null
            ? problemInstance.getInitialState()
            : undefined;

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

      scene = (() => {
        if (algorithmInstance === null) {
          return null;
        }

        const parseResult =
          algorithmInstance.accepts.shape.safeParse(algorithmInput);

        if (!parseResult.success) {
          return null;
        }

        scene = createScene({
          algorithm: algorithmInstance,
          algorithmInput: parseResult,
          maxExecutionStepCount: 100,
        });

        return scene.copyWithExecution(1);
      })();

      postScene(scene);

      return;
    }

    if (action === 'execute') {
      const { untilCount } = data;

      if (scene === null) {
        return;
      }

      scene = scene.copyWithExecution(untilCount);
      postScene(scene);

      return;
    }
  };
}
