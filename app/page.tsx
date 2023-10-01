'use client';

import { Button, MaterialSymbol, Pseudocode } from '@/components';
import { SearchAlgorithms } from '@/lib/algo-sandbox/algorithms/search';
import { createScene } from '@/lib/algo-sandbox/core';
import { UndirectedGraphSearchProblems } from '@/lib/algo-sandbox/problems/graphs';
import { NodeGraphVisualization } from '@/lib/algo-sandbox/visualizations';
import { useMemo, useState } from 'react';
import { ObjectInspector } from 'react-inspector';

const initialScene = createScene({
  algorithm: SearchAlgorithms.bfs,
  problem: UndirectedGraphSearchProblems.fiveNodes,
});
const pseudocode = initialScene.algorithm.pseudocode;

export default function Home() {
  const [scene, setScene] = useState(initialScene);
  const isFullyExecuted = useMemo(() => scene.isFullyExecuted, [scene]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const executionStep = scene.executionTrace.at(currentStepIndex);
  const { startLine, endLine } =
    scene.executionTrace.at(currentStepIndex) ?? {};
  const [showPseudocode, setShowPseudocode] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center px-4 gap-4 border-b py-2 border-slate-300">
        <span className="font-mono">
          algo
          <span className="text-white bg-primary-700 border px-1 rounded">
            sandbox
          </span>
        </span>
        <div className="flex gap-2 items-center">
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
            icon={<MaterialSymbol icon="step_over" className="-scale-x-100" />}
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
              const newScene = scene.copyWithExecution(currentStepIndex + 2);
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
              setCurrentStepIndex(fullyExecutedScene.executionTrace.length - 1);
            }}
            icon={<MaterialSymbol icon="last_page" />}
          />
        </div>
        <Button
          label="Pseudocode"
          icon={<MaterialSymbol icon="code" />}
          onClick={() => {
            setShowPseudocode((showPseudocode) => !showPseudocode);
          }}
        />
      </header>
      <div className="flex-1 flex">
        <aside className="border-e max-w-[200px] p-2">
          <div className="flex flex-col">
            <span className="font-medium text-xs border-b mb-2 pb-2">
              State inspector
            </span>
            {executionStep && (
              <div className="font-mono overflow-x-auto text-xs">
                <ObjectInspector data={executionStep.state} expandLevel={5} />
              </div>
            )}
          </div>
        </aside>
        <main className="relative flex-1 flex-col">
          {showPseudocode && (
            <Pseudocode
              pseudocode={pseudocode}
              startLine={startLine}
              endLine={endLine}
            />
          )}
          <div className="flex-1">
            {executionStep && (
              <NodeGraphVisualization
                key={currentStepIndex}
                graph={executionStep.state.graph}
                getNodeFill={(nodeId) => {
                  console.log(nodeId);
                  if (executionStep.state.currNode === nodeId) {
                    return '#cdf5b8';
                  }
                  if (executionStep.state.visited.has(nodeId)) {
                    return '#a1a1a1';
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
