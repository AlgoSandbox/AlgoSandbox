// BoxPageExecutionWrapper.tsx
'use client';

import {
  BoxControlsContextProvider,
  useBoxContext,
} from '@components/box-page';
import { SceneProvider } from '@components/box-page/SceneProvider';
import useWorkerExecutedScene from '@utils/eval/useWorkerExecutedScene';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function BoxPageExecutionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const box = useBoxContext('box');

  const workerBox = useMemo(() => {
    if (box?.problem === undefined) return null;
    return {
      problem: box?.problem,
      algorithm: box?.algorithm,
      visualizers: box?.visualizers,
      config: box?.config,
    };
  }, [box?.problem, box?.algorithm, box?.visualizers, box?.config]);

  useEffect(() => {
    if (workerBox !== null) setCurrentStepIndex(0);
  }, [box, workerBox]);

  const { scene, execute, isExecuting } = useWorkerExecutedScene({
    box: workerBox,
  });
  const isFullyExecuted = useMemo(
    () => scene?.isFullyExecuted ?? false,
    [scene],
  );

  const handleCurrentStepIndexChange = useCallback(
    async (newStepIndex: number) => {
      if (newStepIndex < scene!.executionTrace.length) {
        setCurrentStepIndex(newStepIndex);
        return;
      }

      if (isFullyExecuted) {
        const clampedStepIndex = Math.min(
          newStepIndex,
          scene!.executionTrace.length - 1,
        );
        setCurrentStepIndex(clampedStepIndex);
        return;
      }

      const newScene = await execute(newStepIndex + 1);
      if (newScene === null) return;

      const clampedStepIndex = Math.min(
        newStepIndex,
        newScene.executionTrace.length - 1,
      );
      setCurrentStepIndex(clampedStepIndex);
    },
    [execute, isFullyExecuted, scene],
  );

  return (
    <BoxControlsContextProvider
      scene={scene}
      isExecuting={isExecuting}
      maxSteps={isFullyExecuted ? scene!.executionTrace.length : null}
      onSkipToEnd={async () => {
        if (isFullyExecuted) {
          setCurrentStepIndex(scene!.executionTrace.length - 1);
          return;
        }
        const newScene = await execute();
        if (newScene === null) return;
        setCurrentStepIndex(newScene.executionTrace.length - 1);
      }}
      currentStepIndex={currentStepIndex}
      onCurrentStepIndexChange={handleCurrentStepIndexChange}
    >
      <SceneProvider scene={scene}>{children}</SceneProvider>
    </BoxControlsContextProvider>
  );
}
