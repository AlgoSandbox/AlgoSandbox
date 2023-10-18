'use client';

import { Button, MaterialSymbol } from '@components/ui';
import { VisualizerRenderer } from '@algo-sandbox/components';
import { useEffect, useMemo, useState } from 'react';
import { ObjectInspector } from 'react-inspector';
import {
  AppBar,
  BoxContextProvider,
  Pseudocode,
  SandboxObjectEditorPanel,
  useBoxContext,
} from '@components/box-page';
import { createScene } from '@utils';
import { TypeDeclaration } from './page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DbSavedAlgorithm, DbSavedSandboxObject } from '@utils/db';
import { CatalogGroup } from '@constants/catalog';

const queryClient = new QueryClient();

function BoxPageImpl({ typeDeclarations }: BoxPageProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showPseudocode, setShowPseudocode] = useState(true);

  const customPanelVisible = useBoxContext('algorithm.customPanel.visible');

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
    if (areAlgorithmProblemCompatible && algorithmInstance !== null) {
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

  const customObjects = useBoxContext('algorithm.custom');

  return (
    <div className="flex flex-col h-screen">
      <AppBar />
      <div className="flex-1 flex overflow-y-hidden">
        {customPanelVisible && (
          <SandboxObjectEditorPanel typeDeclarations={typeDeclarations} customObjects={customObjects} />
        )}
        <main className="relative flex-1 flex flex-col">
          <div className="absolute p-2 max-w-full">
            {showPseudocode && (
              <Pseudocode
                pseudocode={pseudocode}
                startLine={executionStep?.startLine}
                endLine={executionStep?.endLine}
              />
            )}
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
                    <MaterialSymbol icon="step_over" className="-scale-x-100" />
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
                    if (currentStepIndex + 1 < newScene.executionTrace.length) {
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
        <aside className="lg:flex flex-col max-w-[300px] hidden">
          <span className="font-medium text-xs border-b mb-2 py-2">
            State inspector
          </span>
          {executionStep && (
            <div className="font-mono overflow-y-auto text-xs">
              <ObjectInspector data={executionStep.state} expandLevel={5} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

type BoxPageProps = {
  typeDeclarations: Array<TypeDeclaration>;
  builtInAlgorithmOptions: Array<CatalogGroup<DbSavedAlgorithm>>;
};

export default function BoxPage(props: BoxPageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BoxContextProvider builtInAlgorithmOptions={props.builtInAlgorithmOptions}>
        <BoxPageImpl {...props} />
      </BoxContextProvider>
    </QueryClientProvider>
  );
}
