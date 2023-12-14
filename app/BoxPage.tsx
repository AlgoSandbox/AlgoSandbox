'use client';

import { VisualizerRenderer } from '@algo-sandbox/components';
import { SandboxStateType } from '@algo-sandbox/core';
import {
  AppBar,
  BoxContextProvider,
  BoxControlsContextProvider,
  BoxExecutionControls,
  BoxPageShortcuts,
  Pseudocode,
  SandboxObjectEditorPanel,
  useBoxContext,
  useBoxControlsContext,
} from '@components/box-page';
import { ResizeHandle } from '@components/ui';
import { createScene, SandboxScene } from '@utils';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { chromeDark } from 'react-inspector';
import { ObjectInspector } from 'react-inspector';
import { Panel, PanelGroup } from 'react-resizable-panels';

import BoxEnvironmentEditorPage from './BoxEnvironmentEditorPage';

const customChromeDark = {
  ...chromeDark,
  BASE_BACKGROUND_COLOR: 'rgb(10, 10, 10)',
};

function BoxPageExecutionWrapper() {
  const { compatible: areAlgorithmProblemCompatible } =
    useBoxContext('problemAlgorithm');
  const problemInstance = useBoxContext('problem.instance');
  const algorithmInstance = useBoxContext('algorithm.instance');

  const initialScene = useMemo(() => {
    if (
      areAlgorithmProblemCompatible &&
      algorithmInstance !== null &&
      problemInstance !== null
    ) {
      try {
        const scene = createScene({
          algorithm: algorithmInstance,
          problem: problemInstance,
        });

        return scene.copyWithExecution(1);
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }, [areAlgorithmProblemCompatible, algorithmInstance, problemInstance]);
  const [scene, setScene] = useState(initialScene);

  useEffect(() => {
    setScene(initialScene);
  }, [initialScene]);

  const isFullyExecuted = useMemo(
    () => scene?.isFullyExecuted ?? false,
    [scene],
  );

  return (
    <BoxControlsContextProvider
      scene={scene}
      onSceneChange={setScene}
      maxSteps={isFullyExecuted ? scene!.executionTrace.length : null}
    >
      <BoxPageShortcuts>
        <BoxPageImpl scene={scene} />
      </BoxPageShortcuts>
    </BoxControlsContextProvider>
  );
}

function BoxPageImpl({
  scene,
}: {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
}) {
  const { resolvedTheme } = useTheme();
  const mode = useBoxContext('mode.value');
  const customPanelType = useBoxContext('customPanelType');
  const customAlgorithmObjects = useBoxContext('algorithm.custom');
  const customProblemObjects = useBoxContext('problem.custom');
  const customVisualizerObjects = useBoxContext('visualizer.custom');
  const customObjects = (() => {
    switch (customPanelType) {
      case 'algorithm':
        return customAlgorithmObjects;
      case 'problem':
        return customProblemObjects;
      case 'visualizer':
        return customVisualizerObjects;
    }
  })();

  const { currentStepIndex } = useBoxControlsContext();

  const customPanelVisible = customPanelType !== null;

  const { compatible: areAlgorithmVisualizerCompatible } = useBoxContext(
    'algorithmVisualizer',
  );
  const { composed: composedAlgoVizAdapter } = useBoxContext(
    'algorithmVisualizer.adapters',
  );
  const algorithmInstance = useBoxContext('algorithm.instance');
  const visualizerInstance = useBoxContext('visualizer.instance');

  const executionStep = scene?.executionTrace?.[currentStepIndex];
  const pseudocode = algorithmInstance?.pseudocode ?? '';

  const visualization = useMemo(() => {
    if (executionStep && areAlgorithmVisualizerCompatible) {
      const { state: algorithmState } = executionStep;

      const adaptedState =
        composedAlgoVizAdapter?.transform(algorithmState) ?? algorithmState;
      return visualizerInstance?.visualize(adaptedState);
    }
  }, [
    executionStep,
    areAlgorithmVisualizerCompatible,
    composedAlgoVizAdapter,
    visualizerInstance,
  ]);

  if (mode === 'editor') {
    return <BoxEnvironmentEditorPage />;
  }

  return (
    <div className="flex flex-col h-full">
      <AppBar />
      <PanelGroup className="overflow-y-hidden" direction="horizontal">
        {customPanelVisible && customObjects && (
          <>
            <Panel id="left" order={1} defaultSize={30} minSize={30}>
              <SandboxObjectEditorPanel customObjects={customObjects} />
            </Panel>
            <ResizeHandle />
          </>
        )}
        <Panel id="center" order={2} defaultSize={80}>
          <main className="relative h-full flex flex-col">
            <div className="flex-1">
              {visualization && (
                <VisualizerRenderer
                  className="w-full h-full"
                  visualization={visualization}
                />
              )}
            </div>
            <div className="absolute p-2 max-w-full">
              <Pseudocode
                pseudocode={pseudocode}
                startLine={executionStep?.startLine}
                endLine={executionStep?.endLine}
              />
            </div>
            {scene && (
              <div className="absolute w-full bottom-8 flex justify-center">
                <BoxExecutionControls />
              </div>
            )}
          </main>
        </Panel>
        <ResizeHandle />
        <Panel
          className="h-full"
          id="right"
          order={3}
          defaultSize={20}
          minSize={10}
        >
          <aside className="h-full lg:flex flex-col hidden">
            <span className="font-medium text-xs border-b py-2 px-2">
              State inspector
            </span>
            {executionStep && (
              <div className="font-mono text-xs px-2 pt-2 overflow-y-auto">
                <ObjectInspector
                  theme={
                    (resolvedTheme === 'dark'
                      ? customChromeDark
                      : 'chromeLight') as string
                  }
                  data={executionStep.state}
                  expandLevel={5}
                />
              </div>
            )}
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default function BoxPage() {
  return (
    <BoxContextProvider>
      <BoxPageExecutionWrapper />
    </BoxContextProvider>
  );
}
