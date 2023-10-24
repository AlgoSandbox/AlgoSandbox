'use client';

import { VisualizerRenderer } from '@algo-sandbox/components';
import {
  AppBar,
  BoxContextProvider,
  Pseudocode,
  SandboxObjectEditorPanel,
  useBoxContext,
} from '@components/box-page';
import ResizeHandle from '@components/box-page/ResizeHandle';
import { Button, MaterialSymbol } from '@components/ui';
import { CatalogGroup } from '@constants/catalog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createScene } from '@utils';
import { DbAlgorithmSaved, DbProblemSaved } from '@utils/db';
import { useEffect, useMemo, useState } from 'react';
import { ObjectInspector } from 'react-inspector';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { TypeDeclaration } from './page';

const queryClient = new QueryClient();

type BoxPageImplProps = {
  typeDeclarations: Array<TypeDeclaration>;
};

function BoxPageImpl({ typeDeclarations }: BoxPageImplProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const customAlgorithmPanelVisible = useBoxContext(
    'algorithm.customPanel.visible'
  );
  const customProblemPanelVisible = useBoxContext(
    'problem.customPanel.visible'
  );
  const customPanelType = useBoxContext('customPanelType');
  const customAlgorithmObjects = useBoxContext('algorithm.custom');
  const customProblemObjects = useBoxContext('problem.custom');
  const customObjects = (() => {
    switch (customPanelType) {
      case 'algorithm':
        return customAlgorithmObjects;
      case 'problem':
        return customProblemObjects;
    }
  })();

  const customPanelVisible =
    customAlgorithmPanelVisible || customProblemPanelVisible;

  const { compatible: areAlgorithmProblemCompatible } =
    useBoxContext('problemAlgorithm');
  const { compatible: areAlgorithmVisualizerCompatible } = useBoxContext(
    'algorithmVisualizer'
  );
  const { composed: composedAlgoVizAdapter } = useBoxContext(
    'algorithmVisualizer.adapters'
  );
  const { instance: visualizer } = useBoxContext('visualizer');
  const algorithmInstance = useBoxContext('algorithm.instance');
  const problemInstance = useBoxContext('problem.instance');

  const initialScene = useMemo(() => {
    if (
      areAlgorithmProblemCompatible &&
      algorithmInstance !== null &&
      problemInstance !== null
    ) {
      return createScene({
        algorithm: algorithmInstance,
        problem: problemInstance,
      });
    }
    return null;
  }, [areAlgorithmProblemCompatible, algorithmInstance, problemInstance]);
  const [scene, setScene] = useState(initialScene);

  const isFullyExecuted = useMemo(
    () => scene?.isFullyExecuted ?? false,
    [scene]
  );

  const executionStep = scene?.executionTrace?.[currentStepIndex];
  const pseudocode = algorithmInstance?.pseudocode ?? '';

  const visualization = useMemo(() => {
    if (executionStep && areAlgorithmVisualizerCompatible) {
      const { state: algorithmState } = executionStep;

      const adaptedState =
        composedAlgoVizAdapter?.transform(algorithmState) ?? algorithmState;
      return visualizer.visualize(adaptedState);
    }
  }, [
    executionStep,
    areAlgorithmVisualizerCompatible,
    composedAlgoVizAdapter,
    visualizer,
  ]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setScene(initialScene);
  }, [initialScene]);

  return (
    <div className="flex flex-col h-screen">
      <AppBar />
      <PanelGroup className="overflow-y-hidden" direction="horizontal">
        {customPanelVisible && customObjects && (
          <>
            <Panel id="left" order={1} defaultSize={30} minSize={30}>
              <SandboxObjectEditorPanel
                typeDeclarations={typeDeclarations}
                customObjects={customObjects}
              />
            </Panel>
            <ResizeHandle />
          </>
        )}
        <Panel id="center" order={2} defaultSize={80}>
          <main className="relative h-full flex flex-col">
            <div className="absolute p-2 max-w-full">
              <Pseudocode
                pseudocode={pseudocode}
                startLine={executionStep?.startLine}
                endLine={executionStep?.endLine}
              />
            </div>
            {scene && (
              <div className="absolute w-full bottom-8 flex justify-center">
                <div className="flex gap-2 items-center rounded-full border px-4 shadow">
                  <Button
                    disabled={currentStepIndex <= 0}
                    label="Skip to start"
                    hideLabel
                    onClick={() => {
                      setCurrentStepIndex(0);
                    }}
                    icon={<MaterialSymbol icon="first_page" />}
                  />
                  <Button
                    disabled={currentStepIndex <= 0}
                    onClick={() => {
                      setCurrentStepIndex(currentStepIndex - 1);
                    }}
                    hideLabel
                    label="Previous"
                    icon={
                      <MaterialSymbol
                        icon="step_over"
                        className="-scale-x-100"
                      />
                    }
                  />
                  <span className="font-mono px-2">
                    {currentStepIndex + 1}/
                    {isFullyExecuted ? scene.executionTrace.length : '?'}
                  </span>
                  <Button
                    disabled={
                      isFullyExecuted &&
                      currentStepIndex >= scene.executionTrace.length - 1
                    }
                    hideLabel
                    onClick={() => {
                      const newScene = scene.copyWithExecution(
                        currentStepIndex + 2
                      );
                      setScene(newScene);
                      if (
                        currentStepIndex + 1 <
                        newScene.executionTrace.length
                      ) {
                        setCurrentStepIndex(currentStepIndex + 1);
                      }
                    }}
                    label="Next"
                    icon={<MaterialSymbol icon="step_over" />}
                  />
                  <Button
                    label="Skip to end"
                    disabled={
                      isFullyExecuted &&
                      currentStepIndex >= scene.executionTrace.length - 1
                    }
                    hideLabel
                    onClick={() => {
                      const fullyExecutedScene = scene.copyWithExecution();
                      setScene(fullyExecutedScene);
                      setCurrentStepIndex(
                        fullyExecutedScene.executionTrace.length - 1
                      );
                    }}
                    icon={<MaterialSymbol icon="last_page" />}
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              {visualization && (
                <VisualizerRenderer
                  className="w-full h-full"
                  visualization={visualization}
                />
              )}
            </div>
          </main>
        </Panel>
        <ResizeHandle />
        <Panel
          className="h-full"
          id="right"
          order={3}
          defaultSize={20}
          minSize={20}
        >
          <aside className="h-full lg:flex flex-col max-w-[300px] hidden">
            <span className="font-medium text-xs border-b py-2 px-2">
              State inspector
            </span>
            {executionStep && (
              <div className="font-mono text-xs px-2 pt-2 overflow-y-auto">
                <ObjectInspector data={executionStep.state} expandLevel={5} />
              </div>
            )}
          </aside>
        </Panel>
      </PanelGroup>
    </div>
  );
}

type BoxPageProps = BoxPageImplProps & {
  builtInAlgorithmOptions: Array<CatalogGroup<DbAlgorithmSaved>>;
  builtInProblemOptions: Array<CatalogGroup<DbProblemSaved>>;
};

export default function BoxPage({
  builtInAlgorithmOptions,
  builtInProblemOptions,
  ...props
}: BoxPageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BoxContextProvider
        builtInAlgorithmOptions={builtInAlgorithmOptions}
        builtInProblemOptions={builtInProblemOptions}
      >
        <BoxPageImpl {...props} />
      </BoxContextProvider>
    </QueryClientProvider>
  );
}
