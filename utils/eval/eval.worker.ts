// NOTE: This file is a Web Worker script.
// IT CANNOT IMPORT ANY FILES THAT REQUIRE BROWSER ENVIRONMENT.
// LIBRARIES LIKE D3, REACT, REACT_DOM CANNOT BE IMPORTED HERE.
// MAKE SURE THAT ALL IMPORTS DON'T THEMSELVES IMPORT THESE
// EVEN UNUSED IMPORTS WILL CAUSE THIS TO BREAK

import { SandboxBox, SandboxStateType } from '@algo-sandbox/core';
import { SandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { serializeJson } from '@utils/json-serializer';
import { SandboxScene } from '@utils/scene';

import createInitialScene from './createInitialScene';

export type EvalWorkerArgs = {
  action: 'execute';
  data: {
    box: SandboxBox | null;
    sandboxComponents: SandboxComponents;
    untilCount?: number;
    maxExecutionStepCount: number;
    updateCount: number;
  };
};

export type EvalWorkerResponse = {
  scene: string | null;
  finished: boolean;
};

function postScene({
  scene,
  finished,
}: {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
  finished: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { copyWithExecution: _, ...readonlyScene } = scene ?? {};

  const response: EvalWorkerResponse = {
    scene: scene ? serializeJson(readonlyScene) : null,
    finished,
  };

  postMessage(response);
}

{
  let scene: SandboxScene<SandboxStateType, SandboxStateType> | null = null;

  self.onmessage = async (event: MessageEvent<EvalWorkerArgs>) => {
    const { action, data } = event.data;

    // simulate expensive operation
    if (action === 'execute') {
      const { untilCount, maxExecutionStepCount, updateCount, ...rest } = data;
      scene = createInitialScene(rest);
      if (scene === null) {
        return;
      }

      const sceneGenerator = scene.copyWithExecution({
        maxExecutionStepCount,
        untilCount,
        updateCount,
      });
      let sceneIterator = sceneGenerator.next();

      while (!sceneIterator.done) {
        scene = sceneIterator.value;
        postScene({ scene, finished: false });
        sceneIterator = sceneGenerator.next();
      }

      scene = sceneIterator.value;

      postScene({ scene, finished: true });

      return;
    }
  };
}
