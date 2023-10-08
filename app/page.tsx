'use client';
import { Button, MaterialSymbol, Pseudocode } from '@/components';
import { VisualizerRenderer } from '@/lib/algo-sandbox/components';
import { useEffect, useMemo, useState } from 'react';
import { ObjectInspector } from 'react-inspector';
import Visualizers from '@/lib/algo-sandbox/visualizers';
import Select from '@/components/Select';
import Algorithms from '@/lib/algo-sandbox/algorithms';
import { createScene } from '@/lib/algo-sandbox/core';
import Problems from '@/lib/algo-sandbox/problems';
import { SelectOptions } from '@/components/Select';

const algorithmOptions = Object.entries(Algorithms).map(
  ([groupKey, values]) => ({
    key: groupKey,
    label: groupKey,
    options: Object.entries(values).map(([algorithmKey, algorithm]) => ({
      key: algorithmKey,
      label: algorithm.name,
      value: algorithm,
    })),
  })
) satisfies SelectOptions;

const problemOptions = Object.entries(Problems).map(([groupKey, values]) => ({
  key: groupKey,
  label: groupKey,
  options: Object.entries(values).map(([problemKey, problem]) => ({
    key: problemKey,
    label: problem.name,
    value: problem,
  })),
})) satisfies SelectOptions;

export default function Home() {
  const [selectedAlgorithmOption, setSelectedAlgorithmOption] = useState(
    algorithmOptions[0].options[0]
  );
  const [selectedProblemOption, setSelectedProblemOption] = useState(
    problemOptions[0].options[0]
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const algorithm = useMemo(
    () => selectedAlgorithmOption.value,
    [selectedAlgorithmOption.value]
  );
  const problem = useMemo(
    () => selectedProblemOption.value,
    [selectedProblemOption.value]
  );

  const initialScene = useMemo(
    () =>
      createScene({
        algorithm,
        problem,
      }),
    [algorithm, problem]
  );
  const [scene, setScene] = useState(initialScene);
  const pseudocode = algorithm.pseudocode;

  const [showPseudocode, setShowPseudocode] = useState(true);
  const isFullyExecuted = useMemo(() => scene.isFullyExecuted, [scene]);

  const executionStep = scene.executionTrace[currentStepIndex];
  const { startLine, endLine } = executionStep;

  const nodeGraphVisualization = Visualizers.Graphs.searchGraph.visualize(
    executionStep.state
  );

  useEffect(() => {
    setCurrentStepIndex(0);
    setScene(initialScene);
  }, [initialScene]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-start items-center px-4 border-b py-2 divide-x border-slate-300">
        <span className="font-mono me-4">
          algo
          <span className="text-white bg-primary-700 border px-1 rounded">
            sandbox
          </span>
        </span>
        <div className="px-4">
          <Select
            label="Algorithm"
            options={algorithmOptions}
            value={selectedAlgorithmOption}
            onChange={setSelectedAlgorithmOption}
          />
        </div>
        <div className="px-4">
          <Select
            label="Problem"
            options={problemOptions}
            value={selectedProblemOption}
            onChange={setSelectedProblemOption}
          />
        </div>
      </header>
      <div className="flex-1 flex overflow-y-hidden">
        <main className="relative flex-1 flex flex-col">
          <div className="absolute p-2 max-w-full">
            {showPseudocode && (
              <Pseudocode
                pseudocode={pseudocode}
                startLine={startLine}
                endLine={endLine}
              />
            )}
          </div>
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
          <div className="flex-1">
            <VisualizerRenderer
              className="w-full h-full"
              visualization={nodeGraphVisualization}
            />
          </div>
        </main>
        <aside className="lg:flex flex-col max-w-[300px] hidden">
          <span className="font-medium text-xs border-b mb-2 pb-2">
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
