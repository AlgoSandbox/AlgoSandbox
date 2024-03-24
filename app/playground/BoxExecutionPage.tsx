'use client';

import 'react-mosaic-component/react-mosaic-component.css';

import { SandboxVisualization } from '@algo-sandbox/core';
import { VisualizationRenderer } from '@algo-sandbox/react-components';
import { error, ErrorOr, success } from '@app/errors';
import {
  Pseudocode,
  useBoxContext,
  useBoxControlsContext,
} from '@components/box-page';
import ErrorDisplay from '@components/common/ErrorDisplay';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import {
  Button,
  MaterialSymbol,
  ResizeHandle,
  Select,
  SelectOption,
  Tooltip,
} from '@components/ui';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDragDropManager } from 'react-dnd';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { toast } from 'sonner';

import { useFlowchartCalculations, useScene } from './BoxPage';

export default function BoxExecutionPage() {
  const { maxExecutionStepCount } = useUserPreferences();

  const scene = useScene();
  const { currentStepIndex, isExecuting } = useBoxControlsContext();

  const algorithmInstance = useBoxContext('algorithm.instance');
  const { hiddenVisualizerAliases, setHiddenVisualizerAliases } =
    useBoxContext();

  const executionStep = scene?.executionTrace?.[currentStepIndex];
  const pseudocode = algorithmInstance.unwrapOr(null)?.pseudocode ?? '';

  const visualizerOrder = useBoxContext('visualizers.order');
  const visualizerInstances = useBoxContext('visualizers.instances');

  const { inputs } = useFlowchartCalculations();

  const visualizations = useMemo(() => {
    return visualizerOrder.map((alias) => {
      const visualization: ErrorOr<SandboxVisualization<unknown>> =
        visualizerInstances[alias]?.chain(({ value: instance }) => {
          const input = inputs?.[alias] ?? {};

          const parseResult = instance.accepts.shape.safeParse(input);

          if (parseResult.success === false) {
            return error(
              `Visualizer input error:\n${parseResult.error.message}`,
            );
          }

          return success(instance.visualize(parseResult.data));
        }) ?? error(`Visualizer instance with alias = ${alias} not found`);

      return { alias, value: visualization };
    });
  }, [visualizerOrder, visualizerInstances, inputs]);

  const allVisualizerOrder = useMemo(() => {
    return ['pseudocode', ...visualizerOrder];
  }, [visualizerOrder]);

  const visibleVisualizerAliases = useMemo(() => {
    return allVisualizerOrder.filter(
      (alias) => !hiddenVisualizerAliases.has(alias),
    );
  }, [allVisualizerOrder, hiddenVisualizerAliases]);

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

    return makeRowLayout(
      visibleVisualizerAliases[0],
      visibleVisualizerAliases.slice(1),
    );
  }, [visibleVisualizerAliases]);

  const [currentTileMobile, setCurrentTileMobile] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (visualizerOrder.length > 0) {
      if (
        currentTileMobile === null ||
        !visualizerOrder.includes(currentTileMobile)
      ) {
        setCurrentTileMobile(visualizerOrder[0]);
      }
    }
  }, [visualizerOrder, currentTileMobile]);

  const onNextTileClick = useCallback(() => {
    if (currentTileMobile === null) {
      return;
    }

    const currentIndex = visualizerOrder.indexOf(currentTileMobile);
    const nextIndex = (currentIndex + 1) % visualizerOrder.length;

    setCurrentTileMobile(visualizerOrder[nextIndex]);
  }, [currentTileMobile, visualizerOrder]);

  const onPrevTileClick = useCallback(() => {
    if (currentTileMobile === null) {
      return;
    }

    const currentIndex = visualizerOrder.indexOf(currentTileMobile);
    const prevIndex =
      (currentIndex - 1 + visualizerOrder.length) % visualizerOrder.length;

    setCurrentTileMobile(visualizerOrder[prevIndex]);
  }, [currentTileMobile, visualizerOrder]);

  const [layout, setLayout] = useState<MosaicNode<string> | null>(
    initialLayout,
  );

  useEffect(() => {
    setLayout(initialLayout);
  }, [initialLayout]);

  useEffect(() => {
    if (
      (scene?.executionTrace.length ?? 0) > 0 &&
      scene?.didReachExecutionLimit
    ) {
      toast.info(
        `${maxExecutionStepCount} steps executed. You may adjust the max number of execution steps under Settings`,
      );
    }
  }, [
    maxExecutionStepCount,
    scene?.didReachExecutionLimit,
    scene?.executionTrace.length,
  ]);

  const renderTile = useCallback(
    (id: string) => {
      if (id === 'pseudocode') {
        return (
          <Pseudocode
            pseudocode={pseudocode}
            startLine={executionStep?.startLine}
            endLine={executionStep?.endLine}
            tooltip={executionStep?.tooltip}
            stepNumber={currentStepIndex + 1}
          />
        );
      }

      const alias = id;

      const visualization = visualizations.find((v) => v.alias === alias) ?? {
        alias,
        value: error(`Visualization not found for alias: ${alias}`),
      };

      return visualization.value.fold(
        (errorEntries) => {
          // Do not show errors if algorithm is still executing
          if (isExecuting) {
            return <div />;
          }
          return <ErrorDisplay key={alias} errors={errorEntries} />;
        },
        (value) => (
          <VisualizationRenderer
            key={alias}
            className="w-full h-full"
            visualization={value}
          />
        ),
      );
    },
    [
      visualizations,
      pseudocode,
      executionStep?.startLine,
      executionStep?.endLine,
      executionStep?.tooltip,
      currentStepIndex,
      isExecuting,
    ],
  );

  const windowTitles = useMemo(() => {
    const getVisualizerName = (alias: string) => {
      const visualizer = visualizerInstances[alias];

      return (
        visualizer
          ?.map(({ value }) => `${value.name} (${alias})`)
          .unwrapOr(alias) ?? alias
      );
    };

    return {
      pseudocode: 'Pseudocode',
      ...Object.fromEntries(
        visualizerOrder.map((alias) => [alias, getVisualizerName(alias)]),
      ),
    } as Record<string, string>;
  }, [visualizerOrder, visualizerInstances]);

  const tileMobileOptions = useMemo(() => {
    return visualizerOrder.map(
      (alias) =>
        ({
          key: alias,
          label: windowTitles[alias],
          value: alias,
        }) satisfies SelectOption<string>,
    );
  }, [visualizerOrder, windowTitles]);

  const dragAndDropManager = useDragDropManager();

  return (
    <div className="flex flex-col h-full">
      <main className="relative h-full hidden lg:flex flex-col z-0">
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
                    <div className="text-label px-2 font-medium flex items-center justify-between flex-1">
                      <span
                        suppressHydrationWarning
                        className="truncate flex-1 w-0"
                      >
                        {windowTitles[alias]}
                      </span>
                      <button
                        className="text-muted hover:text-on-surface transition flex items-center shrink-0"
                        aria-label="Hide visualizer"
                        onClick={() => {
                          setHiddenVisualizerAliases(
                            new Set(hiddenVisualizerAliases).add(alias),
                          );
                        }}
                      >
                        <MaterialSymbol icon="close" />
                      </button>
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
      </main>
      <main className="h-full lg:hidden">
        <PanelGroup direction="vertical">
          <Panel>{renderTile('pseudocode')}</Panel>
          <ResizeHandle orientation="horizontal" />
          <Panel>
            <div className="relative w-full h-full flex flex-col items-center">
              <div className="flex p-2 items-center self-stretch gap-2">
                <Button
                  label="Previous"
                  hideLabel
                  variant="filled"
                  onClick={onPrevTileClick}
                  icon={<MaterialSymbol icon="arrow_back" />}
                />
                <Select
                  containerClassName="flex-1"
                  hideLabel
                  variant="filled"
                  label="Current visualizer"
                  options={tileMobileOptions}
                  value={tileMobileOptions.find(
                    ({ value: alias }) => alias === currentTileMobile,
                  )}
                  onChange={({ value: alias }) => {
                    setCurrentTileMobile(alias);
                  }}
                />
                <Button
                  label="Next"
                  hideLabel
                  variant="filled"
                  onClick={onNextTileClick}
                  icon={<MaterialSymbol icon="arrow_forward" />}
                />
              </div>
              {currentTileMobile !== null ? (
                renderTile(currentTileMobile)
              ) : (
                <div />
              )}
            </div>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
