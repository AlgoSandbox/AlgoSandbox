'use client';

import 'react-mosaic-component/react-mosaic-component.css';

import {
  AdapterConfigurationTree,
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
import { ResizeHandle } from '@components/ui';
import { createScene, SandboxScene } from '@utils';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragDropManager } from 'react-dnd';
import { chromeDark } from 'react-inspector';
import { ObjectInspector } from 'react-inspector';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import { Panel, PanelGroup } from 'react-resizable-panels';

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

// Return adjacency matrix in the form matrix[src][dst] = [{fromSlot, toSlot}]
function buildGraphFromAdapterConfiguration(
  adapterConfiguration: AdapterConfigurationTree,
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
  adapterConfiguration: AdapterConfigurationTree;
  problem: SandboxProblem<SandboxStateType>;
  algorithmState: Record<string, unknown> | undefined;
  adapters: Record<string, SandboxAdapter<SandboxStateType, SandboxStateType>>;
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
    if (inputs[node] === undefined && node in adapters) {
      // Node should be an adapter
      const adapter = adapters[node];
      const output = adapter.transform(inputs[node]);
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
  const adapterConfigurationTree = useBoxContext(
    'algorithmVisualizers.adapterConfiguration.tree',
  );
  const algorithmState = executionStep?.state;
  const visualizerOrder = useBoxContext('visualizers.order');
  const visualizerInstances = useBoxContext('visualizers.instances');

  const { inputs } = useMemo(() => {
    if (problemInstance === null || algorithmInstance === undefined) {
      return {};
    }

    const { inputs, outputs } = solve({
      adapterConfiguration: adapterConfigurationTree,
      problem: problemInstance,
      algorithmState: algorithmState,
      adapters: {},
    });

    return { inputs, outputs };
  }, [
    problemInstance,
    algorithmInstance,
    adapterConfigurationTree,
    algorithmState,
  ]);

  const visualizations = useMemo(() => {
    return visualizerOrder.map((alias) => {
      const instance = visualizerInstances[alias]?.value;

      if (instance === undefined) {
        return { alias, visualization: null };
      }
      const input = inputs?.[alias] ?? {};
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
        splitPercentage: 50,
      };
    };

    return makeRowLayout('pseudocode', visualizerOrder);
  }, [visualizerOrder]);

  const [layout, setLayout] = useState<MosaicNode<string> | null>(
    initialLayout,
  );

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
    [visualizations, pseudocode, executionStep],
  );

  const dragAndDropManager = useDragDropManager();

  return (
    <div className="flex flex-col h-full">
      <AppBar />
      <PanelGroup className="overflow-y-hidden" direction="horizontal">
        <Panel id="center" order={2} defaultSize={80}>
          <main className="relative h-full flex flex-col">
            <Mosaic<string>
              className={clsx(
                'bg-transparent',
                '[&_.mosaic-window-body]:!bg-canvas',
                '[&_.mosaic-window-toolbar]:!bg-surface',
                '[&_.mosaic-split]:!bg-transparent',
                '[&_.mosaic-previerw]:bg-blue-500',
                '[&_.drop-target-container_.drop-target]:!border-primary',
                '[&_.drop-target-container_.drop-target]:dark:!bg-[rgba(255,255,255,0.1)]',
                '[&_.mosaic-split-line]:transition-colors [&_.mosaic-split-line]:border',
                '[&_.mosaic-split:hover_.mosaic-split-line]:border-2 [&_.mosaic-split:hover_.mosaic-split-line]:border-primary',
              )}
              renderTile={(alias, path) => (
                <MosaicWindow
                  path={path}
                  title={alias}
                  toolbarControls={<div></div>}
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
  return <BoxPageExecutionWrapper />;
}
