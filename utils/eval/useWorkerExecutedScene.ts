'use client';

import { SandboxBox, SandboxStateType } from '@algo-sandbox/core';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { deserializeJson } from '@utils/json-serializer';
import { ReadonlySandboxScene } from '@utils/scene';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { EvalWorkerArgs, EvalWorkerResponse } from './eval.worker';

export default function useWorkerExecutedScene({
  box,
}: {
  box: SandboxBox | null;
}): {
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  execute: (
    untilCount?: number,
  ) => Promise<ReadonlySandboxScene<SandboxStateType> | null>;
  isExecuting: boolean;
} {
  const [scene, setScene] =
    useState<ReadonlySandboxScene<SandboxStateType> | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const sandboxComponents = useSandboxComponents();

  const worker = useMemo(() => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return null;
    }

    const worker = new Worker(
      new URL('/utils/eval/eval.worker.ts', import.meta.url),
      {
        type: 'classic',
      },
    );

    return worker;
  }, []);

  useEffect(() => {
    setScene(null);
    if (worker === null) {
      return;
    }

    worker.onmessage = (event: MessageEvent<EvalWorkerResponse>) => {
      const newScene: ReadonlySandboxScene<SandboxStateType> | null = event.data
        .scene
        ? deserializeJson(event.data.scene)
        : null;
      setScene(newScene);
    };

    const message: EvalWorkerArgs = {
      data: {
        box,
        sandboxComponents,
      },
      action: 'initialize',
    };

    worker.postMessage(message);
  }, [box, sandboxComponents, worker]);

  const execute = useCallback(
    (untilCount?: number) => {
      if (worker === null) {
        return Promise.reject(new Error('Worker is not available'));
      }

      setIsExecuting(true);

      const message: EvalWorkerArgs = {
        data: {
          untilCount,
        },
        action: 'execute',
      };

      const promise =
        new Promise<ReadonlySandboxScene<SandboxStateType> | null>(
          (resolve, reject) => {
            worker.onmessage = (event: MessageEvent<EvalWorkerResponse>) => {
              const newScene: ReadonlySandboxScene<SandboxStateType> | null =
                event.data.scene ? deserializeJson(event.data.scene) : null;
              setScene(newScene);
              resolve(newScene);
            };
            worker.onerror = (error) => {
              reject(error);
            };
          },
        ).finally(() => {
          setIsExecuting(false);
        });

      worker.postMessage(message);

      return promise;
    },
    [worker],
  );

  return useMemo(
    () => ({
      scene,
      execute,
      isExecuting,
    }),
    [execute, isExecuting, scene],
  );
}
