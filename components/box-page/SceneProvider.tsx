'use client';

import { SandboxStateType } from '@algo-sandbox/core';
import { useBoxContext, useBoxControlsContext } from '@components/box-page';
import { ReadonlySandboxScene } from '@utils/scene';
import solveFlowchart from '@utils/solveFlowchart';
import { mapValues } from 'lodash';
import { createContext, useContext, useMemo } from 'react';
import { ZodError } from 'zod';

type SceneContextType = {
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  flowchart: {
    inputs: Record<string, Record<string, unknown> | undefined>;
    outputs: Record<string, Record<string, unknown> | undefined>;
    inputErrors: Record<string, Record<string, ZodError>>;
  };
};

const SceneContext = createContext<SceneContextType>({
  scene: null,
  flowchart: { inputs: {}, outputs: {}, inputErrors: {} },
});

export function SceneProvider({
  scene,
  children,
}: {
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  children: React.ReactNode;
}) {
  const { currentStepIndex } = useBoxControlsContext();
  const algorithmInstanceEvaluation = useBoxContext('algorithm.instance');
  const executionStep = scene?.executionTrace?.[currentStepIndex];
  const problemInstanceEvaluation = useBoxContext('problem.instance');
  const configTree = useBoxContext('config.tree');
  const configAdapterInstances = useBoxContext(
    'config.evaluated.adapterInstances',
  );
  const algorithmState = executionStep?.state;
  const visualizerInstances = useBoxContext('visualizers.instances');

  const { inputs, outputs, inputErrors } = useMemo(() => {
    const problemInstance = problemInstanceEvaluation.unwrapOr(null);
    const algorithmInstance = algorithmInstanceEvaluation.unwrapOr(null);

    if (problemInstance === null || algorithmInstance === null) return {};

    const problemState = problemInstance.getInitialState();

    try {
      const { inputs, outputs, inputErrors } = solveFlowchart({
        config: configTree,
        problemState,
        algorithmState,
        algorithm: algorithmInstanceEvaluation.unwrapOr(null) ?? undefined,
        adapters: mapValues(
          configAdapterInstances ?? {},
          (val) => val?.mapLeft(() => undefined).value?.value,
        ),
        visualizers: mapValues(
          visualizerInstances,
          (evaluation) =>
            evaluation.map((val) => val.value).mapLeft(() => undefined).value,
        ),
      });

      return { inputs, outputs, inputErrors };
    } catch (e) {
      return {};
    }
  }, [
    problemInstanceEvaluation,
    algorithmInstanceEvaluation,
    configTree,
    algorithmState,
    configAdapterInstances,
    visualizerInstances,
  ]);

  const value = useMemo(
    () => ({
      scene,
      flowchart: {
        inputs: inputs ?? {},
        outputs: outputs ?? {},
        inputErrors: inputErrors ?? {},
      },
    }),
    [scene, inputs, outputs, inputErrors],
  );

  return (
    <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
  );
}

export function useScene() {
  return useContext(SceneContext).scene;
}

export function useFlowchartCalculations() {
  return useContext(SceneContext).flowchart;
}
