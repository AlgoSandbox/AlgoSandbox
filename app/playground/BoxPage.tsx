'use client';

import { ComponentTag, SandboxStateType } from '@algo-sandbox/core';
import AppNavBar from '@components/AppNavBar';
import {
  BoxControlsContextProvider,
  BoxExecutionControls,
  BoxPageShortcuts,
  useBoxContext,
  useBoxControlsContext,
} from '@components/box-page';
import CustomizeViewPopover from '@components/box-page/app-bar/CustomizeViewPopover';
import CatalogSelect from '@components/box-page/CatalogSelect';
import SettingsDialog from '@components/common/SettingsDialog';
import DrawerItem from '@components/DrawerItem';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { useTabManager } from '@components/tab-manager/TabManager';
import TabProvider from '@components/tab-manager/TabProvider';
import { Button, Input, MaterialSymbol, TagInput } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import { TabsItem, VerticalTabs } from '@components/ui/VerticalTabs';
import useWorkerExecutedScene from '@utils/eval/useWorkerExecutedScene';
import getSandboxObjectConfig from '@utils/getSandboxObjectConfig';
import groupOptionsByTag from '@utils/groupOptionsByTag';
import { ReadonlySandboxScene } from '@utils/scene';
import solveFlowchart from '@utils/solveFlowchart';
import clsx from 'clsx';
import { mapValues } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ZodError } from 'zod';

function BoxPageExecutionWrapper({ children }: { children: React.ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const box = useBoxContext('box');

  const workerBox = useMemo(() => {
    if (box?.problem === undefined) {
      return null;
    }

    return {
      problem: box?.problem,
      algorithm: box?.algorithm,
      visualizers: box?.visualizers,
      config: box?.config,
    };
  }, [box?.problem, box?.algorithm, box?.visualizers, box?.config]);

  useEffect(() => {
    if (workerBox !== null) {
      setCurrentStepIndex(0);
    }
  }, [box, workerBox]);

  const { scene, execute, isExecuting } = useWorkerExecutedScene({
    box: workerBox,
  });

  const isFullyExecuted = useMemo(
    () => scene?.isFullyExecuted ?? false,
    [scene],
  );

  const handleCurrentStepIndexChange = useCallback(
    async (newStepIndex: number) => {
      if (newStepIndex < scene!.executionTrace.length) {
        setCurrentStepIndex(newStepIndex);
        return;
      }

      if (isFullyExecuted) {
        const clampedStepIndex = Math.min(
          newStepIndex,
          scene!.executionTrace.length - 1,
        );
        setCurrentStepIndex(clampedStepIndex);
        return;
      }

      const newScene = await execute(newStepIndex + 1);
      if (newScene === null) {
        return;
      }

      const clampedStepIndex = Math.min(
        newStepIndex,
        newScene.executionTrace.length - 1,
      );
      setCurrentStepIndex(clampedStepIndex);
    },
    [execute, isFullyExecuted, scene],
  );

  return (
    <BoxControlsContextProvider
      scene={scene}
      isExecuting={isExecuting}
      maxSteps={isFullyExecuted ? scene!.executionTrace.length : null}
      onSkipToEnd={async () => {
        if (isFullyExecuted) {
          setCurrentStepIndex(scene!.executionTrace.length - 1);
          return;
        }
        const newScene = await execute();
        if (newScene === null) {
          return;
        }
        setCurrentStepIndex(newScene.executionTrace.length - 1);
      }}
      currentStepIndex={currentStepIndex}
      onCurrentStepIndexChange={handleCurrentStepIndexChange}
    >
      <BoxPageShortcuts>
        <SceneProvider scene={scene}>{children}</SceneProvider>
      </BoxPageShortcuts>
    </BoxControlsContextProvider>
  );
}

type SceneContextType = {
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  flowchart: {
    inputs: Record<string, Record<string, unknown> | undefined>;
    outputs: Record<string, Record<string, unknown> | undefined>;
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
  scene: ReadonlySandboxScene<SandboxStateType> | null;
  children: React.ReactNode;
}) {
  const { currentStepIndex } = useBoxControlsContext();

  const algorithmInstanceEvaluation = useBoxContext('algorithm.instance');

  const executionStep = scene?.executionTrace?.[currentStepIndex];

  const problemInstanceEvaluation = useBoxContext('problem.instance');
  const configTree = useBoxContext('config.tree');
  const configAdapterInstances = useBoxContext(
    'config.evaluated.adapterInstances',
  );
  const algorithmState = executionStep?.state;

  const visualizerInstances = useBoxContext('visualizers.instances');

  const { inputs, outputs, inputErrors } = useMemo(() => {
    const problemInstance = problemInstanceEvaluation.unwrapOr(null);
    const algorithmInstance = algorithmInstanceEvaluation.unwrapOr(null);

    if (problemInstance === null || algorithmInstance === null) {
      return {};
    }

    const problemState = problemInstance.getInitialState();

    try {
      const { inputs, outputs, inputErrors } = solveFlowchart({
        config: configTree,
        problemState,
        algorithmState,
        adapters: mapValues(
          configAdapterInstances ?? {},
          (val) => val?.mapLeft(() => undefined).value?.value,
        ),
        visualizers: mapValues(
          visualizerInstances,
          (evaluation) =>
            evaluation.map((val) => val.value).mapLeft(() => undefined).value,
        ),
      });

      return { inputs, outputs, inputErrors };
    } catch (e) {
      return {};
    }
  }, [
    problemInstanceEvaluation,
    algorithmInstanceEvaluation,
    configTree,
    algorithmState,
    configAdapterInstances,
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
  const router = useRouter();
  const {
    isBoxCustom,
    save: saveBox,
    isBoxDirty,
    delete: deleteBox,
  } = useBoxContext();
  const { boxOptions } = useSandboxComponents();
  const groupedBoxOptions = useMemo(() => {
    return groupOptionsByTag(boxOptions, { omitTags: ['box'] });
  }, [boxOptions]);

  const selectedOption = useMemo(() => {
    return boxOptions.find((option) => option.value.key === boxKey);
  }, [boxOptions, boxKey]);

  const selectedOptionTags = useMemo(() => {
    if (selectedOption === undefined) {
      return [];
    }

    return getSandboxObjectConfig(selectedOption.value).tags;
  }, [selectedOption]);

  const [saveBoxDialogOpen, setSaveBoxDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<{
    name: string;
    tags: Array<ComponentTag>;
  }>({
    defaultValues: {
      name: selectedOption?.label ?? '',
      tags: selectedOptionTags,
    },
  });

  useEffect(() => {
    reset({
      name: selectedOption?.label ?? '',
      tags: selectedOptionTags,
    });
  }, [selectedOption, reset, selectedOptionTags]);

  const {
    selectedTabId,
    tabs,
    renderTabContent,
    reorderTabs,
    closeTab,
    selectTab,
  } = useTabManager();

  const isExecutionPageVisible = useMemo(() => {
    return selectedTabId === 'box';
  }, [selectedTabId]);

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

  const handleSaveClick = () => {
    setSaveBoxDialogOpen(true);
  };

  const handleSaveBox: typeof saveBox = async (options) => {
    setSaveBoxDialogOpen(false);
    await saveBox(options);
    if (options.asNew) {
      toast.success(`Saved as "${options.name}"`);
    } else {
      toast.success(`Saved changes to ${options.name}`);
    }
  };

  const handleDeleteClick = async () => {
    const boxLabel = selectedOption?.label ?? '';
    await deleteBox();
    toast.success(`Deleted "${boxLabel}"`);
    router.push('/playground');
  };

  const hasBox = selectedOption !== undefined;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <div className="flex flex-col w-dvw h-dvh">
        <AppNavBar
          drawerContents={
            <div>
              {hasBox && (
                <div className="border-t border-b flex flex-col md:hidden">
                  {!isBoxCustom && (
                    <DrawerItem
                      label="Copy link"
                      onClick={handleCopyLinkClick}
                      icon="link"
                    />
                  )}
                  <DrawerItem
                    label="Save"
                    onClick={handleSaveClick}
                    icon="save"
                  />
                  {isBoxCustom && (
                    <DrawerItem
                      label="Delete"
                      onClick={handleDeleteClick}
                      icon="delete"
                    />
                  )}
                </div>
              )}
              <VerticalTabs
                showLabels={true}
                draggable={false}
                tabs={tabItems}
                onTabsReorder={reorderTabs}
                onTabSelect={(tab) => {
                  selectTab(tab.key);
                }}
                onTabClose={(tab) => {
                  closeTab(tab.key);
                }}
              />
              <div className="border-t">
                <DrawerItem
                  label="Settings"
                  onClick={() => {
                    setShowSettings(true);
                  }}
                  icon="settings"
                />
              </div>
            </div>
          }
        >
          <div className="flex justify-between flex-1 px-2">
            <div className="flex flex-1 md:flex-none items-center gap-2 py-2">
              <CatalogSelect
                containerClassName="flex-1 md:flex-auto"
                className="w-full"
                options={groupedBoxOptions}
                label="Select box"
                hideLabel={true}
                variant="primary"
                value={selectedOption}
                onChange={(option) => {
                  if (option === null) {
                    router.push('/playground');
                    return;
                  }

                  router.push(`/playground?box=${option.value.key}`);
                }}
              />
              {hasBox && (
                <div className="hidden md:flex gap-2 min-w-0">
                  {!isBoxCustom && (
                    <Button
                      label="Copy link"
                      onClick={handleCopyLinkClick}
                      hideLabel
                      icon={<MaterialSymbol icon="link" />}
                    />
                  )}
                  <Button
                    label="Save"
                    onClick={handleSaveClick}
                    hideLabel
                    icon={<MaterialSymbol icon="save" />}
                  />
                  {isBoxCustom && (
                    <Button
                      label="Delete"
                      hideLabel
                      onClick={handleDeleteClick}
                      icon={<MaterialSymbol icon="delete" />}
                    />
                  )}
                </div>
              )}
            </div>
            {isExecutionPageVisible && (
              <div className="ms-4 hidden lg:flex items-center gap-4">
                <CustomizeViewPopover />
                <BoxExecutionControls />
              </div>
            )}
          </div>
        </AppNavBar>
        <div className="flex flex-1">
          <div className="hidden flex-col items-stretch h-full lg:flex justify-between border-e">
            <VerticalTabs
              showLabels={false}
              draggable={true}
              tabs={tabItems}
              onTabsReorder={reorderTabs}
              onTabSelect={(tab) => {
                selectTab(tab.key);
              }}
              onTabClose={(tab) => {
                closeTab(tab.key);
              }}
            />
            <Button
              hideLabel={true}
              size="lg"
              label="Settings"
              icon={<MaterialSymbol icon="settings" />}
              onClick={() => {
                setShowSettings(true);
              }}
            />
          </div>
          {tabs.map((tab) => (
            <TabProvider key={tab.id} tab={tab}>
              <main
                className={clsx(
                  'flex-1 overflow-auto',
                  tab.id !== selectedTabId && 'hidden',
                )}
              >
                {renderTabContent(tab.id)}
              </main>
            </TabProvider>
          ))}
        </div>
        {isExecutionPageVisible && (
          <div className="flex px-2 gap-4 justify-center border-t items-center py-2 lg:hidden">
            <BoxExecutionControls />
          </div>
        )}
      </div>
      <Dialog
        title="Save box"
        content={
          <form
            onSubmit={handleSubmit((data) => {
              handleSaveBox({ ...data, asNew: !isBoxCustom });
            })}
          >
            <Input
              label="Name"
              containerClassName="flex-1 mb-2"
              {...register('name')}
            />
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput
                  label="Tags (enter to add)"
                  value={field.value}
                  onChange={(tags) => {
                    field.onChange({
                      target: {
                        value: tags,
                      },
                    });
                  }}
                />
              )}
            />
            <div className="flex gap-2 mt-4 justify-end">
              {!isBoxCustom && (
                <Button type="submit" variant="primary" label="Save as new" />
              )}
              {isBoxCustom && (
                <>
                  <Button
                    type="button"
                    variant="filled"
                    label="Save as new"
                    onClick={() => {
                      handleSaveBox({ ...getValues(), asNew: true });
                    }}
                  />
                  <Button
                    label="Save"
                    variant="primary"
                    type="submit"
                    disabled={!isBoxDirty && !isDirty}
                    onClick={handleSaveClick}
                  />
                </>
              )}
            </div>
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
