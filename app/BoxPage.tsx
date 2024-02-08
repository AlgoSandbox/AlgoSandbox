'use client';

import 'react-mosaic-component/react-mosaic-component.css';

import {
  AlgorithmVisualizersTree,
  SandboxAdapter,
  SandboxProblem,
  SandboxStateType,
} from '@algo-sandbox/core';
import { VisualizerRenderer } from '@algo-sandbox/react-components';
import {
  AppBar,
  BoxControlsContextProvider,
  BoxExecutionControls,
  BoxPageShortcuts,
  Pseudocode,
  useBoxContext,
  useBoxControlsContext,
} from '@components/box-page';
import { MaterialSymbol, Tooltip } from '@components/ui';
import { createScene, SandboxScene } from '@utils';
import clsx from 'clsx';
import { mapValues } from 'lodash';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragDropManager } from 'react-dnd';
import { chromeDark } from 'react-inspector';
import { ObjectInspector } from 'react-inspector';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';

const customChromeDark = {
  ...chromeDark,
  BASE_BACKGROUND_COLOR: 'rgb(1 8 31)',
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

function topologicalSort(graph: Record<string, Array<string>>) {
  const visited = new Set<string>();
  const result: Array<string> = [];

  function dfs(node: string) {
    if (visited.has(node)) {
      return;
    }

    visited.add(node);

    for (const neighbor of graph[node] ?? []) {
      dfs(neighbor);
    }

    result.push(node);
  }

  for (const node of Object.keys(graph)) {
    dfs(node);
  }

  return result.reverse();
}

function buildGraphFromAdapterConfiguration(
  adapterConfiguration: AlgorithmVisualizersTree,
) {
  const graph: Record<
    string,
    Record<string, Array<{ fromSlot: string; toSlot: string }>>
  > = {};

  adapterConfiguration.composition.connections.forEach(
    ({ fromKey, fromSlot, toKey, toSlot }) => {
      if (graph[fromKey] === undefined) {
        graph[fromKey] = {};
      }

      if (graph[fromKey][toKey] === undefined) {
        graph[fromKey][toKey] = [];
      }

      graph[fromKey][toKey].push({ fromSlot, toSlot });
    },
  );

  return graph;
}

function solve({
  adapterConfiguration,
  problem,
  algorithmState,
  adapters,
}: {
  adapterConfiguration: AlgorithmVisualizersTree;
  problem: SandboxProblem<SandboxStateType>;
  algorithmState: Record<string, unknown> | undefined;
  adapters: Record<
    string,
    SandboxAdapter<SandboxStateType, SandboxStateType> | undefined
  >;
}) {
  const graph = buildGraphFromAdapterConfiguration(adapterConfiguration);
  const nodesToExplore = topologicalSort(
    Object.fromEntries(
      Object.keys(graph).map((key) => [key, Object.keys(graph[key])]),
    ),
  );

  const outputs: Record<string, Record<string, unknown>> = {
    problem: problem.initialState,
    algorithm: algorithmState ?? {},
  };

  const inputs: Record<string, Record<string, unknown>> = {};

  while (nodesToExplore.length > 0) {
    const node = nodesToExplore.shift()!;
    const neighbors = graph[node] ?? {};

    // Try to calculate the state of the node from intermediates
    if (outputs[node] === undefined && node in adapters) {
      // Node should be an adapter
      const adapter = adapters[node];
      if (adapter === undefined) {
        continue;
      }
      // Inputs should be full
      const result = adapter.accepts.shape.safeParse(inputs[node]);
      if (!result.success) {
        continue;
      }
      const output = adapter.transform(result.data);
      outputs[node] = output;
    }

    for (const [neighbor, connections] of Object.entries(neighbors)) {
      connections.forEach(({ fromSlot, toSlot }) => {
        inputs[neighbor] = {
          ...inputs[neighbor],
          [toSlot]: outputs[node][fromSlot],
        };
      });
    }
  }
  return { inputs, outputs };
}

function BoxPageImpl({
  scene,
}: {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
}) {
  const { resolvedTheme } = useTheme();

  const { currentStepIndex } = useBoxControlsContext();

  const algorithmInstance = useBoxContext('algorithm.instance');

  const executionStep = scene?.executionTrace?.[currentStepIndex];
  const pseudocode = algorithmInstance?.pseudocode ?? '';

  const problemInstance = useBoxContext('problem.instance');
  const algorithmVisualizersTree = useBoxContext('algorithmVisualizers.tree');
  const algorithmVisualizersAdapters = useBoxContext(
    'algorithmVisualizers.evaluated.adapters',
  );
  const algorithmState = executionStep?.state;
  const visualizerOrder = useBoxContext('visualizers.order');
  const visualizerInstances = useBoxContext('visualizers.instances');

  const { inputs } = useMemo(() => {
    if (problemInstance === null || algorithmInstance === undefined) {
      return {};
    }

    const { inputs, outputs } = solve({
      adapterConfiguration: algorithmVisualizersTree,
      problem: problemInstance,
      algorithmState: algorithmState,
      adapters: mapValues(
        algorithmVisualizersAdapters ?? {},
        (val) => val?.value,
      ),
    });

    return { inputs, outputs };
  }, [
    problemInstance,
    algorithmInstance,
    algorithmVisualizersTree,
    algorithmState,
    algorithmVisualizersAdapters,
  ]);

  const visualizations = useMemo(() => {
    return visualizerOrder.map((alias) => {
      const instance = visualizerInstances[alias]?.value;

      if (instance === undefined) {
        return { alias, visualization: null };
      }

      const input = inputs?.[alias] ?? {};

      if (instance.accepts.shape.safeParse(input).success === false) {
        return { alias, visualization: null };
      }

      return { alias, visualization: instance.visualize(input) };
    });
  }, [visualizerOrder, visualizerInstances, inputs]);

  const initialLayout: MosaicNode<string> | null = useMemo(() => {
    const makeRowLayout = (
      alias: string,
      remainingAliases: Array<string>,
    ): MosaicNode<string> => {
      if (remainingAliases.length === 0) {
        return alias;
      }

      return {
        direction: 'row',
        first: alias,
        second: makeRowLayout(remainingAliases[0], remainingAliases.slice(1)),
        splitPercentage: 100 / (remainingAliases.length + 1),
      };
    };

    return makeRowLayout('pseudocode', [...visualizerOrder, 'state-inspector']);
  }, [visualizerOrder]);

  const [layout, setLayout] = useState<MosaicNode<string> | null>(
    initialLayout,
  );

  useEffect(() => {
    setLayout(initialLayout);
  }, [initialLayout]);

  const renderTile = useCallback(
    (id: string) => {
      if (id === 'pseudocode') {
        return (
          <Pseudocode
            pseudocode={pseudocode}
            startLine={executionStep?.startLine}
            endLine={executionStep?.endLine}
          />
        );
      }
      if (id === 'state-inspector') {
        if (executionStep === undefined) {
          return <div className="text-label">Error in execution</div>;
        }
        return (
          <div className="font-mono w-full h-full text-xs px-2 pt-2 overflow-y-auto">
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
        );
      }

      const alias = id;

      const visualization = visualizations.find((v) => v.alias === alias)
        ?.visualization;

      if (visualization) {
        return (
          <VisualizerRenderer
            key={alias}
            className="w-full h-full"
            visualization={visualization}
          />
        );
      }

      return (
        <div className="w-full flex items-center h-full" key={alias}>
          Error in visualization: {alias}
        </div>
      );
    },
    [visualizations, pseudocode, executionStep, resolvedTheme],
  );

  const windowTitles = useMemo(() => {
    const getVisualizerName = (alias: string) => {
      const visualizer = visualizerInstances[alias];
      if (visualizer === undefined) {
        return alias;
      }
      return `${visualizer.name} (${alias})`;
    };

    return {
      pseudocode: 'Pseudocode',
      'state-inspector': 'Algorithm state',
      ...Object.fromEntries(
        visualizerOrder.map((alias) => [alias, getVisualizerName(alias)]),
      ),
    } as Record<string, string>;
  }, [visualizerOrder, visualizerInstances]);

  const dragAndDropManager = useDragDropManager();

  return (
    <div className="flex flex-col h-full">
      <AppBar />
      <main className="relative h-full flex flex-col z-0">
        <Mosaic<string>
          className={clsx(
            'bg-transparent',
            '[&_.mosaic-window-body]:!bg-surface',
            '[&_.mosaic-window-toolbar]:!bg-surface-high',
            '[&_.mosaic-split]:!bg-transparent',
            '[&_.mosaic-tile]:!m-1',
            [
              '[&_.mosaic-root]:!top-1',
              '[&_.mosaic-root]:!bottom-1',
              '[&_.mosaic-root]:!left-1',
              '[&_.mosaic-root]:!right-1',
            ],
            ['[&_.mosaic-window]:rounded', '[&_.mosaic-window]:border'],
            [
              '[&_.mosaic-split.-row]:!-ml-1',
              '[&_.mosaic-split.-row]:!py-1',
              '[&_.mosaic-split.-row]:!w-2',
              '[&_.mosaic-split.-row]:flex',
              '[&_.mosaic-split.-row]:justify-center',
            ],
            [
              '[&_.mosaic-split.-column]:!-mt-1',
              '[&_.mosaic-split.-column]:!px-1',
              '[&_.mosaic-split.-column]:!h-2',
              '[&_.mosaic-split.-column]:flex',
              '[&_.mosaic-split.-column]:flex-col',
              '[&_.mosaic-split.-column]:justify-center',
            ],
            '[&_.mosaic-split_.mosaic-split-line]:rounded-full',
            '[&_.mosaic-split_.mosaic-split-line]:!relative',
            [
              '[&_.mosaic-split.-row_.mosaic-split-line]:!left-auto',
              '[&_.mosaic-split.-row_.mosaic-split-line]:!right-auto',
              '[&_.mosaic-split.-row_.mosaic-split-line]:h-full',
              '[&_.mosaic-split.-row_.mosaic-split-line]:w-1',
            ],
            [
              '[&_.mosaic-split.-column_.mosaic-split-line]:!top-auto',
              '[&_.mosaic-split.-column_.mosaic-split-line]:!bottom-auto',
              '[&_.mosaic-split.-column_.mosaic-split-line]:w-full',
              '[&_.mosaic-split.-column_.mosaic-split-line]:h-1',
            ],
            '[&_.drop-target-container_.drop-target]:!border-primary',
            '[&_.drop-target-container_.drop-target]:!rounded',
            '[&_.drop-target-container_.drop-target]:dark:!bg-[rgba(255,255,255,0.1)]',
            '[&_.drop-target-container_.drop-target]:!bg-[rgba(0,0,0,0.1)]',
            '[&_.mosaic-split-line]:transition-colors',
            '[&_.mosaic-split-line]:bg-transparent',
            '[&_.mosaic-split:hover_.mosaic-split-line]:bg-primary',
          )}
          renderTile={(alias, path) => (
            <MosaicWindow
              path={path}
              title={alias}
              toolbarControls={<div></div>}
              renderToolbar={() => (
                <div className="flex w-full">
                  <Tooltip content={windowTitles[alias]}>
                    <div className="text-label px-2 font-medium truncate flex items-center justify-between flex-1">
                      {windowTitles[alias]}
                      <MaterialSymbol
                        icon="drag_handle"
                        className="text-muted"
                      />
                    </div>
                  </Tooltip>
                </div>
              )}
            >
              {renderTile(alias)}
            </MosaicWindow>
          )}
          value={layout}
          onChange={setLayout}
          dragAndDropManager={dragAndDropManager}
        />
        {scene && (
          <div className="absolute w-full z-10 bottom-8 flex justify-center">
            <BoxExecutionControls />
          </div>
        )}
      </main>
    </div>
  );
}

export default function BoxPage() {
  return <BoxPageExecutionWrapper />;
}
