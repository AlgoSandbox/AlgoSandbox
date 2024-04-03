import { SandboxObjectType } from '@algo-sandbox/components';
import { SandboxBox } from '@algo-sandbox/core';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { mapValues } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

import convertBoxConfigToTree from './convertBoxConfigToTree';
import { DbSandboxObjectSaved } from './db';
import createInitialScene from './eval/createInitialScene';
import evalBox from './eval/evalBox';
import evalWithAlgoSandbox from './eval/evalWithAlgoSandbox';
import {
  isParameterizedAlgorithm,
  isParameterizedProblem,
  isParameterizedVisualizer,
} from './isParameterized';
import solveFlowchart from './solveFlowchart';
import useCancelableInterval from './useCancelableInterval';

const MAX_EXECUTION_STEP_COUNT = 50;

export default function usePreviewVisualization<T extends SandboxObjectType>(
  object: DbSandboxObjectSaved<T> | null,
  options?: {
    enabled?: boolean;
    playAnimation?: boolean;
  },
) {
  const [isClientSide, setIsClientSide] = useState(false);
  const { enabled = true, playAnimation = true } = options ?? {};
  const sandboxComponents = useSandboxComponents();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  const selectedBox = useMemo(() => {
    if (object === null) {
      return null;
    }

    if (!isClientSide) {
      return null;
    }

    if (!enabled) {
      return null;
    }

    const { files } = object;

    if (!files) {
      return null;
    }

    const defaultBoxFilePath = (() => {
      if (object.type === 'box') {
        return Object.keys(files).find((path) => path.includes('index.ts'));
      }

      return Object.keys(files).find((path) => path.includes('default-box.ts'));
    })();

    if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
      return null;
    }

    const defaultBoxCode = files[defaultBoxFilePath];

    if (defaultBoxCode === undefined) {
      return null;
    }

    const defaultBox = evalWithAlgoSandbox<SandboxBox>(defaultBoxCode, {
      fileContext: {
        files,
        currentFilePath: defaultBoxFilePath,
      },
    }).mapLeft(() => null).value;

    if (defaultBox === null) {
      return null;
    }

    return defaultBox;
  }, [enabled, isClientSide, object]);

  const scene = useMemo(() => {
    if (object === null || !isClientSide) {
      return null;
    }

    const initialScene = createInitialScene({
      box: selectedBox,
      sandboxComponents,
      files: object.files,
    });

    if (initialScene === null) {
      return null;
    }

    const sceneGenerator = initialScene.copyWithExecution({
      untilCount: MAX_EXECUTION_STEP_COUNT,
      maxExecutionStepCount: MAX_EXECUTION_STEP_COUNT,
      updateCount: MAX_EXECUTION_STEP_COUNT,
    });

    return sceneGenerator.next().value;
  }, [isClientSide, object, sandboxComponents, selectedBox]);

  const {
    visualizerInstance,
    algorithmInstance,
    problemInstance,
    evaledBox,
    visualizerAlias,
  } = useMemo(() => {
    if (selectedBox === null || object === null || !isClientSide) {
      return {};
    }

    const { files } = object;

    if (!files) {
      return {};
    }

    const defaultBoxFilePath = (() => {
      if (object.type === 'box') {
        return Object.keys(files).find((path) => path.includes('index.ts'));
      }

      return Object.keys(files).find((path) => path.includes('default-box.ts'));
    })();

    if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
      return {};
    }

    const evaledBox = evalBox({
      box: selectedBox,
      sandboxComponents,
      currentFilePath: defaultBoxFilePath,
      files,
    });

    const {
      problem: problemComponent,
      algorithm: algorithmComponent,
      visualizers,
    } = evaledBox;

    const visualizerAlias = visualizers?.order[0];

    if (visualizerAlias === undefined) {
      return {};
    }

    const visualizerInstance = (() => {
      if (visualizers === undefined) {
        return null;
      }

      const visualizerComponent = visualizers.aliases[visualizerAlias];

      if (visualizerComponent === undefined) {
        return null;
      }

      const { parameters, component: visualizer } = visualizerComponent;

      if (isParameterizedVisualizer(visualizer)) {
        return visualizer.create(parameters ?? undefined);
      }

      return visualizer;
    })();

    const problemInstance = (() => {
      if (problemComponent === undefined) {
        return null;
      }

      const { parameters, component: problem } = problemComponent;

      if (isParameterizedProblem(problem)) {
        return problem.create(parameters ?? undefined);
      }

      return problem;
    })();

    const algorithmInstance = (() => {
      if (algorithmComponent === undefined) {
        return null;
      }

      const { parameters, component: algorithm } = algorithmComponent;

      if (isParameterizedAlgorithm(algorithm)) {
        return algorithm.create(parameters ?? undefined);
      }

      return algorithm;
    })();

    return {
      algorithmInstance,
      problemInstance,
      visualizerInstance,
      visualizerAlias,
      evaledBox,
    };
  }, [isClientSide, object, sandboxComponents, selectedBox]);

  const executionTrace = useMemo(() => {
    return scene?.executionTrace ?? null;
  }, [scene]);

  const stepCount = scene?.executionTrace.length ?? null;

  const incrementStep = useCallback(async () => {
    setStepIndex((stepIndex) => {
      const newStepCount = stepCount !== null ? (stepIndex + 1) % stepCount : 0;

      return newStepCount;
    });

    return true;
  }, [stepCount]);

  const interval = useCancelableInterval(incrementStep, 500);

  useEffect(() => {
    if (!interval.isRunning && playAnimation && enabled && object !== null) {
      interval.start();
    }

    if (
      (interval.isRunning && (object === null || !enabled)) ||
      !playAnimation
    ) {
      interval.stop();
    }
  }, [enabled, interval, object, playAnimation]);

  useEffect(() => {
    if (!playAnimation) {
      // set step index to halfway
      setStepIndex(Math.floor((stepCount ?? 0) / 2));
    }
  }, [playAnimation, stepCount]);

  const visualization = useMemo(() => {
    if (!visualizerInstance || executionTrace === null || !isClientSide) {
      return null;
    }

    try {
      const step = executionTrace.at(stepIndex);
      if (step === undefined) {
        return null;
      }

      if (problemInstance === null || algorithmInstance === undefined) {
        return null;
      }

      const config = selectedBox?.config;

      if (!config) {
        return null;
      }

      const visualizerAliases = Object.keys(
        selectedBox?.visualizers.aliases ?? {},
      );
      const configTree = convertBoxConfigToTree(config, visualizerAliases);

      const problemState = problemInstance.getInitialState();
      const algorithmState = step.state;

      const visualizerInstances = {
        [visualizerAlias]: visualizerInstance,
      };
      const adapters = evaledBox.config?.adapters ?? {};
      const adapterInstances = mapValues(adapters, (adapterComponent) => {
        if (adapterComponent === undefined) {
          return undefined;
        }

        const { component: adapter, parameters } = adapterComponent;

        if ('parameters' in adapter) {
          return adapter.create(parameters ?? undefined);
        }

        return adapter;
      });

      try {
        const { inputs } = solveFlowchart({
          config: configTree,
          problemState,
          algorithmState,
          adapters: adapterInstances,
          visualizers: visualizerInstances,
        });

        const visualizerInput = inputs[visualizerAlias];

        return visualizerInstance.visualize(visualizerInput);
      } catch (e) {
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [
    algorithmInstance,
    evaledBox?.config?.adapters,
    executionTrace,
    isClientSide,
    problemInstance,
    selectedBox?.config,
    selectedBox?.visualizers.aliases,
    stepIndex,
    visualizerAlias,
    visualizerInstance,
  ]);

  return visualization;
}
