'use client';

import { SandboxBox, SandboxStateType } from '@algo-sandbox/core';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { deserializeJson } from '@utils/json-serializer';
import { ReadonlySandboxScene } from '@utils/scene';
import { useEffect, useState } from 'react';

import { EvalWorkerArgs, EvalWorkerResponse } from './eval.worker';

export default function useWorkerExecutedScene({
  box,
}: {
  box: SandboxBox | null;
}): {
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  isExecuting: boolean;
} {
  const [scene, setScene] =
    useState<ReadonlySandboxScene<SandboxStateType> | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const sandboxComponents = useSandboxComponents();
  const { maxExecutionStepCount } = useUserPreferences();

  useEffect(() => {
    // If there's no box or we're in an environment without Worker support,
    // just reset scene and bail out.
    if (
      !box ||
      typeof window === 'undefined' ||
      typeof Worker === 'undefined'
    ) {
      setScene(null);
      return;
    }

    // 1. Create the worker
    const worker = new Worker(
      new URL('/utils/eval/eval.worker.ts', import.meta.url),
      { type: 'classic' },
    );

    setIsExecuting(true);

    // 2. Listen for worker messages
    worker.onmessage = (event: MessageEvent<EvalWorkerResponse>) => {
      const { scene: serializedScene, finished } = event.data;
      if (serializedScene) {
        const newScene = deserializeJson(serializedScene);
        setScene(newScene);
      }

      if (finished) {
        // When the worker signals it's finished,
        // we can turn off our "isExecuting" spinner/flag.
        setIsExecuting(false);
      }
    };

    // 3. Handle any worker errors
    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setIsExecuting(false);
    };

    // 4. Post a single "execute" message to fully set up and run
    worker.postMessage({
      action: 'execute',
      data: {
        // pass in the box, the custom components, and execution params
        box,
        sandboxComponents,
        // If you want to limit the total steps, you can pass them here
        untilCount: maxExecutionStepCount,
        maxExecutionStepCount,
        // how often you want partial updates (if your worker posts updates)
        updateCount: 10,
      },
    } as EvalWorkerArgs);

    // 5. Clean up the worker on unmount or if `box` changes
    return () => {
      worker.terminate();
    };
  }, [box, sandboxComponents, maxExecutionStepCount]);

  return { scene, isExecuting };
}
