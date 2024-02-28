'use client';

import { SandboxProblem, SandboxStateType } from '@algo-sandbox/core';
import AppNavBar from '@components/AppNavBar';
import {
  BoxControlsContextProvider,
  BoxExecutionControls,
  BoxPageShortcuts,
  useBoxContext,
  useBoxControlsContext,
} from '@components/box-page';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useUserPreferences } from '@components/preferences/UserPreferencesProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import TabProvider from '@components/tab-manager/TabProvider';
import { Button, Input, MaterialSymbol, Popover, Select } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import Heading from '@components/ui/Heading';
import Toggle from '@components/ui/Toggle';
import { TabsItem, VerticalTabs } from '@components/ui/VerticalTabs';
import { createScene, SandboxScene } from '@utils';
import solveFlowchart from '@utils/solveFlowchart';
import clsx from 'clsx';
import { mapValues } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ZodError } from 'zod';

const themeOptions = [
  { label: 'System', key: 'system', value: 'system' },
  { label: 'Light', key: 'light', value: 'light' },
  { label: 'Dark', key: 'dark', value: 'dark' },
];

function BoxPageExecutionWrapper({ children }: { children: React.ReactNode }) {
  const { compatible: areAlgorithmProblemCompatible } =
    useBoxContext('problemAlgorithm');
  const problemInstanceEvaluation = useBoxContext('problem.instance');
  const composedProblemAdapter = useBoxContext(
    'problemAlgorithm.adapters.composed',
  );
  const algorithmInstanceEvaluation = useBoxContext('algorithm.instance');
  const { maxExecutionStepCount: maxExecutionStepCount } = useUserPreferences();

  const initialScene = useMemo(() => {
    const problemInstance = problemInstanceEvaluation.unwrapOr(null);
    const algorithmInstance = algorithmInstanceEvaluation.unwrapOr(null);
    const problemAdapter = composedProblemAdapter.unwrapOr(null);
    if (
      areAlgorithmProblemCompatible &&
      algorithmInstance !== null &&
      problemInstance !== null
    ) {
      try {
        const initialProblemState = problemInstance.getInitialState();
        const adaptedProblemState =
          problemAdapter?.transform(initialProblemState) ?? initialProblemState;

        const adaptedProblem: SandboxProblem<SandboxStateType> = {
          name: problemInstance.name,
          type: problemAdapter?.outputs ?? problemInstance.type,
          getInitialState: () => adaptedProblemState,
        };

        const scene = createScene({
          algorithm: algorithmInstance,
          problem: adaptedProblem,
          maxExecutionStepCount,
        });

        return scene.copyWithExecution(1);
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }, [
    problemInstanceEvaluation,
    algorithmInstanceEvaluation,
    composedProblemAdapter,
    areAlgorithmProblemCompatible,
    maxExecutionStepCount,
  ]);
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
        <SceneProvider scene={scene}>{children}</SceneProvider>
      </BoxPageShortcuts>
    </BoxControlsContextProvider>
  );
}

type SceneContextType = {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
  flowchart: {
    inputs: Record<string, Record<string, unknown>>;
    outputs: Record<string, Record<string, unknown>>;
    inputErrors: Record<string, Record<string, ZodError>>;
  };
};
const SceneContext = createContext<SceneContextType>({
  scene: null,
  flowchart: { inputs: {}, outputs: {}, inputErrors: {} },
});

function SceneProvider({
  scene,
  children,
}: {
  scene: SandboxScene<SandboxStateType, SandboxStateType> | null;
  children: React.ReactNode;
}) {
  const { currentStepIndex } = useBoxControlsContext();

  const algorithmInstanceEvaluation = useBoxContext('algorithm.instance');

  const executionStep = scene?.executionTrace?.[currentStepIndex];

  const problemInstanceEvaluation = useBoxContext('problem.instance');
  const problemAdapterCompatible = useBoxContext('problemAlgorithm.compatible');
  const algorithmVisualizersTree = useBoxContext('algorithmVisualizers.tree');
  const algorithmVisualizersAdapterInstances = useBoxContext(
    'algorithmVisualizers.evaluated.adapterInstances',
  );
  const algorithmState = executionStep?.state;

  const visualizerInstances = useBoxContext('visualizers.instances');

  const { inputs, outputs, inputErrors } = useMemo(() => {
    const problemInstance = problemInstanceEvaluation.unwrapOr(null);
    const algorithmInstance = algorithmInstanceEvaluation.unwrapOr(null);

    if (problemInstance === null || algorithmInstance === null) {
      return {};
    }

    if (!problemAdapterCompatible) {
      return {};
    }

    const problemState = problemInstance.getInitialState();

    const { inputs, outputs, inputErrors } = solveFlowchart({
      adapterConfiguration: algorithmVisualizersTree,
      problemState,
      algorithmState,
      adapters: mapValues(
        algorithmVisualizersAdapterInstances ?? {},
        (val) => val?.mapLeft(() => undefined).value?.value,
      ),
      visualizers: mapValues(
        visualizerInstances,
        (evaluation) =>
          evaluation.map((val) => val.value).mapLeft(() => undefined).value,
      ),
    });

    return { inputs, outputs, inputErrors };
  }, [
    problemInstanceEvaluation,
    algorithmInstanceEvaluation,
    problemAdapterCompatible,
    algorithmVisualizersTree,
    algorithmState,
    algorithmVisualizersAdapterInstances,
    visualizerInstances,
  ]);

  const value = useMemo(
    () => ({
      scene,
      flowchart: {
        inputs: inputs ?? {},
        outputs: outputs ?? {},
        inputErrors: inputErrors ?? {},
      },
    }),
    [scene, inputs, outputs, inputErrors],
  );
  return (
    <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
  );
}

export function useScene() {
  return useContext(SceneContext).scene;
}

export function useFlowchartCalculations() {
  return useContext(SceneContext).flowchart;
}

function BoxPageImpl() {
  const boxKey = useSearchParams().get('box') ?? '';
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const selectedThemeOption = useMemo(() => {
    return themeOptions.find((option) => option.value === theme);
  }, [theme]);
  const {
    isAdvancedModeEnabled,
    setAdvancedModeEnabled,
    isBoxComponentsShown,
    setBoxComponentsShown,
    maxExecutionStepCount,
    setMaxExecutionStepCount,
  } = useUserPreferences();
  const { isDraft, reset, saveAsNew } = useBoxContext();
  const { boxOptions } = useSandboxComponents();

  const selectedOption = useMemo(() => {
    const flattenedOptions = boxOptions.flatMap((group) => group.options);
    return flattenedOptions.find((option) => option.key === boxKey);
  }, [boxOptions, boxKey]);

  const [saveBoxDialogOpen, setSaveBoxDialogOpen] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: '',
    },
  });

  const {
    selectedTabId,
    tabs,
    renderTabContent,
    reorderTabs,
    closeTab,
    selectTab,
  } = useTabManager();

  const tabItems = useMemo(() => {
    return tabs.map(
      (tab) =>
        ({
          key: tab.id,
          label: tab.label,
          icon: tab.icon,
          subIcon: tab.subIcon,
          isSelected: tab.id === selectedTabId,
          closeable: tab.closeable,
        }) satisfies TabsItem,
    );
  }, [selectedTabId, tabs]);

  const handleCopyLinkClick = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
    toast.success('Link copied to clipboard');
  };

  const handleSaveAsNewClick = () => {
    setSaveBoxDialogOpen(true);
  };

  const handleSaveBox = async (newBoxName: string) => {
    setSaveBoxDialogOpen(false);
    saveAsNew(newBoxName);
    toast.success(`Saved as "${newBoxName}"`);
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <AppNavBar>
          <div className="flex justify-between flex-1 px-2">
            <div className="flex items-center gap-2 pe-4 py-2">
              <CatalogSelect
                containerClassName="shrink"
                options={boxOptions}
                label="Select box"
                hideLabel={true}
                variant="primary"
                value={selectedOption}
                onChange={(option) => {
                  router.push(`/playground?box=${option.key}`);
                }}
              />
              <div className="flex gap-2 min-w-0">
                <Button
                  label="Customize"
                  className="min-w-0"
                  variant="filled"
                  selected={isBoxComponentsShown}
                  role="checkbox"
                  hideLabel={true}
                  onClick={() => {
                    setBoxComponentsShown(!isBoxComponentsShown);
                  }}
                  icon={<MaterialSymbol icon="tune" />}
                />
                {!isDraft && (
                  <Button
                    label="Reset box"
                    hideLabel={true}
                    variant="flat"
                    onClick={reset}
                    icon={<MaterialSymbol icon="settings_backup_restore" />}
                  />
                )}
                <div className="border-l w-px self-stretch"></div>
                {!isDraft && (
                  <Button
                    label="Copy link"
                    variant="filled"
                    onClick={handleCopyLinkClick}
                    icon={<MaterialSymbol icon="link" />}
                  />
                )}
                <Button
                  label="Save as new"
                  variant="filled"
                  onClick={handleSaveAsNewClick}
                  icon={<MaterialSymbol icon="save" />}
                />
              </div>
            </div>
            <div className="hidden lg:flex items-center">
              <BoxExecutionControls />
            </div>
          </div>
        </AppNavBar>
        <div className="flex flex-1">
          <div className="flex flex-col items-stretch h-full justify-between border-e">
            <VerticalTabs
              tabs={tabItems}
              onTabsReorder={reorderTabs}
              onTabSelect={(tab) => {
                selectTab(tab.key);
              }}
              onTabClose={(tab) => {
                closeTab(tab.key);
              }}
            />
            <Popover
              content={
                <div className="bg-surface p-4 flex flex-col gap-4 items-start">
                  <Heading variant="h4">Settings</Heading>
                  <Select
                    options={themeOptions}
                    value={selectedThemeOption}
                    onChange={(option) => {
                      setTheme(option.value);
                    }}
                    label="Theme"
                  />
                  <Toggle
                    label="Advanced mode"
                    value={isAdvancedModeEnabled}
                    onChange={setAdvancedModeEnabled}
                  />
                  <Input
                    label="Max execution steps"
                    value={maxExecutionStepCount.toString()}
                    onChange={(e) => {
                      setMaxExecutionStepCount(parseInt(e.target.value, 10));
                    }}
                    type="number"
                  />
                </div>
              }
            >
              <Button
                hideLabel={true}
                size="lg"
                label="Settings"
                icon={<MaterialSymbol icon="settings" />}
              />
            </Popover>
          </div>
          {tabs.map((tab) => (
            <TabProvider key={tab.id} tab={tab}>
              <main
                className={clsx('flex-1', tab.id !== selectedTabId && 'hidden')}
              >
                {renderTabContent(tab.id)}
              </main>
            </TabProvider>
          ))}
        </div>
        <div className="flex justify-center items-center py-2 lg:hidden">
          <BoxExecutionControls />
        </div>
      </div>
      <Dialog
        title="Save box"
        content={
          <form
            onSubmit={handleSubmit((data) => {
              handleSaveBox(data.name);
            })}
          >
            <Input
              label="Name"
              containerClassName="flex-1"
              {...register('name')}
            />
            <Button
              className="mt-2"
              label="Save"
              type="submit"
              variant="primary"
            />
          </form>
        }
        open={saveBoxDialogOpen}
        onOpenChange={(open) => {
          setSaveBoxDialogOpen(open);
        }}
      />
    </>
  );
}

export default function BoxPage() {
  return (
    <BoxPageExecutionWrapper>
      <BoxPageImpl />
    </BoxPageExecutionWrapper>
  );
}
