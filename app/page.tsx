'use client';

import {
  AlgorithmDetails,
  Badge,
  Button,
  MaterialSymbol,
  Popover,
  Pseudocode,
  Select,
  Tooltip,
} from '@/components';
import { SelectGroup } from '@/components/Select';
import Algorithms from '@/lib/algo-sandbox/algorithms';
import { VisualizerRenderer } from '@/lib/algo-sandbox/components';
import {
  ParsedParameters,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameteredProblem,
  SandboxParameteredVisualizer,
  SandboxParameters,
  SandboxProblem,
  SandboxStateName,
  SandboxVisualizer,
  createScene,
  getDefaultParameters,
} from '@/lib/algo-sandbox/core';
import Problems from '@/lib/algo-sandbox/problems';
import Visualizers from '@/lib/algo-sandbox/visualizers';
import {
  isParameteredAlgorithm,
  isParameteredProblem,
  isParameteredVisualizer,
} from '@/utils/isParametered';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ObjectInspector } from 'react-inspector';

const algorithmOptions: Array<
  SelectGroup<
    | SandboxAlgorithm<SandboxStateName, any>
    | SandboxParameteredAlgorithm<SandboxStateName, any, any>
  >
> = Object.entries(Algorithms).map(([groupKey, values]) => ({
  key: groupKey,
  label: groupKey,
  options: Object.entries(values).map(([algorithmKey, algorithm]) => ({
    key: algorithmKey,
    label: algorithm.name,
    value: algorithm,
  })),
}));

const problemOptions: Array<
  SelectGroup<
    | SandboxProblem<SandboxStateName>
    | SandboxParameteredProblem<SandboxStateName, any>
  >
> = Object.entries(Problems).map(([groupKey, values]) => ({
  key: groupKey,
  label: groupKey,
  options: Object.entries(values).map(([problemKey, problem]) => ({
    key: problemKey,
    label: problem.name,
    value: problem,
  })),
}));

const visualizerOptions: Array<
  SelectGroup<SandboxVisualizer<any> | SandboxParameteredVisualizer<any, any>>
> = [
  {
    key: 'graphs',
    label: 'Graphs',
    options: [
      {
        key: 'searchGraph',
        label: 'Search graph',
        value: Visualizers.Graphs.searchGraph,
      },
      {
        key: 'nodeGraph',
        label: 'Node graph',
        value: Visualizers.Graphs.Parametered.nodeGraph,
      },
    ],
  },
];

export default function Home() {
  const [selectedAlgorithmOption, setSelectedAlgorithmOption] = useState(
    algorithmOptions[0].options[0]
  );
  const [selectedProblemOption, setSelectedProblemOption] = useState(
    problemOptions[0].options[0]
  );
  const [selectedVisualizerOption, setSelectedVisualizerOption] = useState(
    visualizerOptions[0].options[0]
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const algorithm = useMemo(() => {
    const { value } = selectedAlgorithmOption;

    if (isParameteredAlgorithm(value)) {
      return value;
    }

    return {
      name: value.name,
      parameters: {},
      create: () => {
        return value;
      },
    } satisfies SandboxParameteredAlgorithm<
      typeof value.accepts,
      typeof value.outputs,
      {}
    >;
  }, [selectedAlgorithmOption]);

  const [parameters, setParameters] = useState<
    ParsedParameters<SandboxParameters>
  >({});

  const problem = useMemo(() => {
    const { value } = selectedProblemOption;

    if (isParameteredProblem(value)) {
      return value.create();
    }

    return value;
  }, [selectedProblemOption]);

  const visualizer = useMemo(() => {
    const { value } = selectedVisualizerOption;

    if (isParameteredVisualizer(value)) {
      return value.create();
    }

    return value;
  }, [selectedVisualizerOption]);

  const [showPseudocode, setShowPseudocode] = useState(true);

  const methods = useForm<Record<string, any>>({});

  const defaultParameters = useMemo(
    () =>
      getDefaultParameters(
        algorithm.parameters
      ) as ParsedParameters<SandboxParameters>,
    [algorithm.parameters]
  );

  useEffect(() => {
    setParameters(defaultParameters);
    methods.reset(defaultParameters);
  }, [defaultParameters, methods]);

  const isAlgorithmCustomizable = isParameteredAlgorithm(
    selectedAlgorithmOption.value
  );

  const algorithmInstance = useMemo(
    () => algorithm.create(parameters),
    [algorithm, parameters]
  );
  const areAlgorithmVisualizerCompatible =
    visualizer.accepts === algorithmInstance.outputs;

  const areAlgorithmProblemCompatible =
    algorithmInstance.accepts === problem.shape;

  const initialScene = useMemo(() => {
    if (areAlgorithmProblemCompatible) {
      return createScene({
        algorithm: algorithmInstance,
        problem,
      });
    }
    return null;
  }, [algorithmInstance, problem, areAlgorithmProblemCompatible]);
  const [scene, setScene] = useState(initialScene);

  const isFullyExecuted = useMemo(
    () => scene?.isFullyExecuted ?? false,
    [scene]
  );

  const executionStep = scene?.executionTrace?.[currentStepIndex];
  const pseudocode = algorithmInstance.pseudocode;

  const visualization = useMemo(() => {
    if (executionStep && areAlgorithmVisualizerCompatible) {
      return visualizer.visualize(executionStep.state);
    }
  }, [executionStep, areAlgorithmVisualizerCompatible, visualizer]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setScene(initialScene);
  }, [initialScene]);

  const changedParameterCount = useMemo(() => {
    return Object.keys(parameters).filter(
      (key) => parameters[key] !== defaultParameters[key]
    ).length;
  }, [parameters, defaultParameters]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-start items-center px-4 border-b py-2 border-slate-300 gap-8">
        <span className="font-mono">
          algo
          <span className="text-white bg-primary-700 border px-1 rounded">
            sandbox
          </span>
        </span>
        <div className="flex flex-row items-end gap-2">
          <Select
            label="Problem"
            options={problemOptions}
            value={selectedProblemOption}
            onChange={setSelectedProblemOption}
          />
          <Tooltip
            disabled={areAlgorithmProblemCompatible}
            content="Problem incompatible with algorithm"
          >
            <MaterialSymbol
              icon="keyboard_double_arrow_right"
              className={clsx(
                'pb-2',
                areAlgorithmProblemCompatible && 'text-neutral-500',
                !areAlgorithmProblemCompatible && 'text-red-500'
              )}
            />
          </Tooltip>
          <Select
            label="Algorithm"
            options={algorithmOptions}
            value={selectedAlgorithmOption}
            onChange={setSelectedAlgorithmOption}
          />
          {isAlgorithmCustomizable && (
            <Popover
              content={
                <FormProvider {...methods}>
                  <form
                    onSubmit={methods.handleSubmit((values) => {
                      setParameters(values);
                      methods.reset(values);
                    })}
                  >
                    <AlgorithmDetails
                      algorithm={selectedAlgorithmOption.value}
                    />
                  </form>
                </FormProvider>
              }
            >
              <Badge
                visible={changedParameterCount > 0}
                content={changedParameterCount}
              >
                <Button
                  label="Customize"
                  hideLabel
                  variant="secondary"
                  icon={<MaterialSymbol icon="tune" />}
                />
              </Badge>
            </Popover>
          )}
          <Tooltip
            disabled={areAlgorithmVisualizerCompatible}
            content="Visualizer incompatible with algorithm"
          >
            <MaterialSymbol
              icon="keyboard_double_arrow_right"
              className={clsx(
                'pb-2',
                areAlgorithmVisualizerCompatible && 'text-neutral-500',
                !areAlgorithmVisualizerCompatible && 'text-red-500'
              )}
            />
          </Tooltip>
          <div className="flex-1">
            <Select
              label="Visualizer"
              options={visualizerOptions}
              value={selectedVisualizerOption}
              onChange={setSelectedVisualizerOption}
            />
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-y-hidden">
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
