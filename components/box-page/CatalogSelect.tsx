import { SandboxObjectType } from '@algo-sandbox/components';
import {
  getDefaultParameters,
  SandboxBox,
  SandboxParameters,
} from '@algo-sandbox/core';
import { VisualizationRenderer } from '@algo-sandbox/react-components';
import MarkdownPreview from '@components/common/MarkdownPreview';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import {
  Button,
  Chip,
  FormLabel,
  Input,
  isSelectGroup,
  MaterialSymbol,
  Popover,
  Tooltip,
} from '@components/ui';
import { ButtonProps } from '@components/ui/Button';
import { CatalogOption, CatalogOptions } from '@constants/catalog';
import convertBoxConfigToTree from '@utils/convertBoxConfigToTree';
import { DbSandboxObjectSaved } from '@utils/db';
import { useDeleteObjectMutation } from '@utils/db/objects';
import createInitialScene from '@utils/eval/createInitialScene';
import evalBox from '@utils/eval/evalBox';
import evalSavedObject from '@utils/eval/evalSavedObject';
import evalWithAlgoSandbox from '@utils/eval/evalWithAlgoSandbox';
import getSandboxObjectConfig from '@utils/getSandboxObjectConfig';
import getSandboxObjectWriteup from '@utils/getSandboxObjectWriteup';
import {
  isParameterizedAlgorithm,
  isParameterizedProblem,
  isParameterizedVisualizer,
} from '@utils/isParameterized';
import solveFlowchart from '@utils/solveFlowchart';
import { useBreakpoint } from '@utils/useBreakpoint';
import useCancelableInterval from '@utils/useCancelableInterval';
import clsx from 'clsx';
import { mapValues } from 'lodash';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ParameterControls } from '.';

const MAX_EXECUTION_STEP_COUNT = 50;

export type CatalogSelectProps<
  T extends SandboxObjectType,
  O extends CatalogOption<DbSandboxObjectSaved<T>> = CatalogOption<
    DbSandboxObjectSaved<T>
  >,
> = {
  className?: string;
  containerClassName?: string;
  options: CatalogOptions<DbSandboxObjectSaved<T>>;
  placeholder?: string;
  value?: O;
  onChange?: (value: O | null, parameters: SandboxParameters | null) => void;
  label: string;
  hideLabel?: boolean;
  variant?: ButtonProps['variant'];
  errorMessage?: string | null;
  showPreview?: boolean;
  showParameters?: boolean;
};

function ListItem<T>({
  active,
  selected,
  option,
  onClick,
  onDoubleClick,
  disabled,
}: {
  option: CatalogOption<T>;
  onClick?: () => void;
  onDoubleClick?: () => void;
  active: boolean;
  selected: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      className={active ? 'font-semibold' : ''}
      label={option.label}
      selected={selected}
      role="checkbox"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
    />
  );
}

export default function CatalogSelect<T extends SandboxObjectType>({
  options,
  containerClassName,
  className,
  label,
  placeholder,
  hideLabel,
  variant = 'filled',
  value,
  onChange,
  errorMessage,
  showParameters = false,
  showPreview = true,
}: CatalogSelectProps<T>) {
  const [selectedOption, setSelectedOption] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const selectedOptionTags = useMemo(() => {
    if (selectedOption === undefined) {
      return [];
    }

    return getSandboxObjectConfig(selectedOption.value).tags;
  }, [selectedOption]);

  const selectedOptionWriteup = useMemo(() => {
    if (selectedOption === undefined) {
      return undefined;
    }

    return (
      getSandboxObjectWriteup(selectedOption.value) ??
      `# ${selectedOption.label}`
    );
  }, [selectedOption]);

  const { mutateAsync: deleteObject } = useDeleteObjectMutation<T>();
  const sandboxComponents = useSandboxComponents();
  const [query, setQuery] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const objectInstance = useMemo(() => {
    if (selectedOption === undefined) {
      return null;
    }

    return evalSavedObject(selectedOption.value).mapLeft(() => null).value;
  }, [selectedOption]);

  const objectParameters = useMemo(() => {
    if (objectInstance === null) {
      return null;
    }

    if ('parameters' in objectInstance) {
      return objectInstance.parameters as SandboxParameters;
    }

    return null;
  }, [objectInstance]);

  const defaultObjectParameters = useMemo(() => {
    if (objectParameters === null) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getDefaultParameters(objectParameters) as Record<string, any>;
  }, [objectParameters]);

  const methods = useForm({
    defaultValues: defaultObjectParameters ?? {},
  });
  const { reset, getValues } = methods;

  useEffect(() => {
    reset(defaultObjectParameters ?? {});
  }, [defaultObjectParameters, reset]);

  const selectedBox = useMemo(() => {
    if (selectedOption === undefined) {
      return null;
    }

    if (!showPreview || !open) {
      return null;
    }

    const {
      value: { files },
    } = selectedOption;

    if (!files) {
      return null;
    }

    const defaultBoxFilePath = Object.keys(files).find((path) =>
      path.includes('default-box.ts'),
    );

    if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
      return null;
    }

    const defaultBoxCode = files[defaultBoxFilePath];

    if (defaultBoxCode === undefined) {
      return null;
    }

    const defaultBox = evalWithAlgoSandbox<SandboxBox>(defaultBoxCode, {
      fileContext: {
        files,
        currentFilePath: defaultBoxFilePath,
      },
    }).mapLeft(() => null).value;

    if (defaultBox === null) {
      return null;
    }

    return defaultBox;
  }, [open, selectedOption, showPreview]);

  const scene = useMemo(() => {
    const initialScene = createInitialScene({
      box: selectedBox,
      sandboxComponents,
      files: selectedOption?.value.files ?? {},
    });

    if (initialScene === null) {
      return null;
    }

    const sceneGenerator = initialScene.copyWithExecution({
      untilCount: MAX_EXECUTION_STEP_COUNT,
      maxExecutionStepCount: MAX_EXECUTION_STEP_COUNT,
      updateCount: MAX_EXECUTION_STEP_COUNT,
    });

    return sceneGenerator.next().value;
  }, [sandboxComponents, selectedBox, selectedOption?.value.files]);

  const {
    visualizerInstance,
    algorithmInstance,
    problemInstance,
    evaledBox,
    visualizerAlias,
  } = useMemo(() => {
    if (selectedBox === null || selectedOption === undefined) {
      return {};
    }

    const {
      value: { files },
    } = selectedOption;

    if (!files) {
      return {};
    }

    const defaultBoxFilePath = Object.keys(files).find((path) =>
      path.includes('default-box.ts'),
    );

    if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
      return {};
    }

    const evaledBox = evalBox({
      box: selectedBox,
      sandboxComponents,
      currentFilePath: defaultBoxFilePath,
      files,
    });

    const {
      problem: problemComponent,
      algorithm: algorithmComponent,
      visualizers,
    } = evaledBox;

    const visualizerAlias = visualizers?.order[0];

    if (visualizerAlias === undefined) {
      return {};
    }

    const visualizerInstance = (() => {
      if (visualizers === undefined) {
        return null;
      }

      const visualizerComponent = visualizers.aliases[visualizerAlias];

      if (visualizerComponent === undefined) {
        return null;
      }

      const { parameters, component: visualizer } = visualizerComponent;

      if (isParameterizedVisualizer(visualizer)) {
        return visualizer.create(parameters ?? undefined);
      }

      return visualizer;
    })();

    const problemInstance = (() => {
      if (problemComponent === undefined) {
        return null;
      }

      const { parameters, component: problem } = problemComponent;

      if (isParameterizedProblem(problem)) {
        return problem.create(parameters ?? undefined);
      }

      return problem;
    })();

    const algorithmInstance = (() => {
      if (algorithmComponent === undefined) {
        return null;
      }

      const { parameters, component: algorithm } = algorithmComponent;

      if (isParameterizedAlgorithm(algorithm)) {
        return algorithm.create(parameters ?? undefined);
      }

      return algorithm;
    })();

    return {
      algorithmInstance,
      problemInstance,
      visualizerInstance,
      visualizerAlias,
      evaledBox,
    };
  }, [sandboxComponents, selectedBox, selectedOption]);

  const executionTrace = useMemo(() => {
    return scene?.executionTrace ?? null;
  }, [scene]);

  const stepCount = scene?.executionTrace.length ?? null;

  const incrementStep = useCallback(async () => {
    setStepIndex((stepIndex) => {
      const newStepCount = stepCount !== null ? (stepIndex + 1) % stepCount : 0;

      return newStepCount;
    });

    return true;
  }, [stepCount]);

  const interval = useCancelableInterval(incrementStep, 1000);

  useEffect(() => {
    if (!interval.isRunning && selectedOption !== null && open) {
      interval.start();
    }

    if (interval.isRunning && (selectedOption === null || !open)) {
      interval.stop();
    }
  }, [interval, open, selectedOption]);

  const visualization = useMemo(() => {
    if (!visualizerInstance || executionTrace === null) {
      return null;
    }

    try {
      const step = executionTrace.at(stepIndex);
      if (step === undefined) {
        return null;
      }

      if (problemInstance === null || algorithmInstance === undefined) {
        return null;
      }

      const config = selectedBox?.config;

      if (!config) {
        return null;
      }

      const visualizerAliases = Object.keys(
        selectedBox?.visualizers.aliases ?? {},
      );
      const configTree = convertBoxConfigToTree(config, visualizerAliases);

      const problemState = problemInstance.getInitialState();
      const algorithmState = step.state;

      const visualizerInstances = {
        [visualizerAlias]: visualizerInstance,
      };
      const adapters = evaledBox.config?.adapters ?? {};
      const adapterInstances = mapValues(adapters, (adapterComponent) => {
        if (adapterComponent === undefined) {
          return undefined;
        }

        const { component: adapter, parameters } = adapterComponent;

        if ('parameters' in adapter) {
          return adapter.create(parameters ?? undefined);
        }

        return adapter;
      });

      try {
        const { inputs } = solveFlowchart({
          config: configTree,
          problemState,
          algorithmState,
          adapters: adapterInstances,
          visualizers: visualizerInstances,
        });

        const visualizerInput = inputs[visualizerAlias];

        return visualizerInstance.visualize(visualizerInput);
      } catch (e) {
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [
    algorithmInstance,
    evaledBox?.config?.adapters,
    executionTrace,
    problemInstance,
    selectedBox?.config,
    selectedBox?.visualizers.aliases,
    stepIndex,
    visualizerAlias,
    visualizerInstance,
  ]);

  // For mobile
  const [showItemDetails, setShowItemDetails] = useState(false);

  const { isMd } = useBreakpoint('md');

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  useEffect(() => {
    if (open) {
      setShowItemDetails(false);
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div className="flex bg-surface h-[400px]">
          <div
            className={clsx(
              'w-full md:w-auto flex flex-col border-r overflow-y-hidden',
              isMd && 'flex',
              !isMd && [showItemDetails ? 'hidden' : 'flex'],
            )}
          >
            <Input
              containerClassName="bg-surface mx-4 mt-4 sticky top-0"
              label="Search"
              type="search"
              hideLabel
              placeholder="Search..."
              value={query}
              onChange={handleQueryChange}
            />
            <div className="flex flex-col p-4 overflow-y-auto">
              {options
                .map((item) => {
                  if (isSelectGroup(item)) {
                    return {
                      ...item,
                      options: item.options.filter(
                        (item) =>
                          query === '' ||
                          item.label
                            .toLocaleLowerCase()
                            .includes(query.toLocaleLowerCase()),
                      ),
                    };
                  }
                  return item;
                })
                .filter(
                  (item) =>
                    query === '' ||
                    item.label
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase()) ||
                    isSelectGroup(item),
                )
                .filter(
                  (item) => !isSelectGroup(item) || item.options.length > 0,
                )
                .map((item) => {
                  if (isSelectGroup(item)) {
                    const areAllItemsDisabled = item.options.every(
                      (option) => option.disabled,
                    );

                    return (
                      <Fragment key={item.key}>
                        <div className="flex items-center pt-4 text-sm border-t">
                          <Chip disabled={areAllItemsDisabled}>
                            {item.label}
                          </Chip>
                        </div>
                        {item.options.map((option) => (
                          <ListItem
                            selected={option.key === selectedOption?.key}
                            active={option.key === selectedOption?.key}
                            disabled={option.disabled}
                            key={`${item.key}.${option.key}`}
                            option={option}
                            onClick={() => {
                              setSelectedOption?.(option);
                              setShowItemDetails(true);
                              // setStepIndex(0);
                            }}
                            onDoubleClick={() => {
                              onChange?.(option, null);
                              setOpen(false);
                            }}
                          />
                        ))}
                      </Fragment>
                    );
                  } else {
                    return (
                      <ListItem
                        selected={item.key === selectedOption?.key}
                        active={item.key === selectedOption?.key}
                        disabled={item.disabled}
                        key={item.key}
                        option={item}
                        onClick={() => {
                          setSelectedOption?.(item);
                          setShowItemDetails(true);
                        }}
                        onDoubleClick={() => {
                          onChange?.(item, null);
                          setOpen(false);
                        }}
                      />
                    );
                  }
                })}
            </div>
          </div>
          {selectedOption !== undefined && (showItemDetails || isMd) && (
            <div className="w-full md:w-[300px] overflow-y-auto">
              <Button
                className="md:hidden mx-4"
                label="Back"
                variant="filled"
                icon={<MaterialSymbol icon="arrow_back" />}
                onClick={() => setShowItemDetails(false)}
              />
              {visualization && showPreview && (
                <div className="w-[300px] h-[200px] relative rounded-tr-md bg-canvas border-b overflow-clip">
                  <VisualizationRenderer
                    className="w-[300px] h-[200px] absolute top-0 left-0 overflow-visible"
                    visualization={visualization}
                    zoom={0.33}
                  />
                </div>
              )}
              {!visualization && showPreview && (
                <div className="w-[300px] h-[200px] rounded-tr-md bg-canvas flex border-b justify-center items-center">
                  <span className="text-label">No preview available</span>
                </div>
              )}
              <div className="p-4 flex-col flex gap-2 items-start">
                <MarkdownPreview markdown={selectedOptionWriteup!} />
                <div className="flex gap-2 flex-wrap">
                  {selectedOptionTags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                {showParameters && objectParameters && (
                  <div className="border-t mt-2 pt-4">
                    <FormProvider {...methods}>
                      <ParameterControls
                        showCustomize={false}
                        parameters={objectParameters}
                        onSave={() => {}}
                      />
                    </FormProvider>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="primary"
                    label="Select"
                    type="submit"
                    onClick={() => {
                      const parameterValues = getValues();
                      onChange?.(selectedOption, parameterValues);
                      setOpen(false);
                    }}
                  />
                  {selectedOption.type === 'custom' && (
                    <Button
                      variant="primary"
                      label="Delete"
                      onClick={async () => {
                        await deleteObject(selectedOption.value);
                        toast.success(`Deleted "${selectedOption.label}"`);
                        onChange?.(null, null);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className={clsx('flex flex-col min-w-[200px]', containerClassName)}>
        <div className="flex items-center gap-1">
          <FormLabel className={hideLabel ? 'hidden' : ''}>{label}</FormLabel>
          {errorMessage && (
            <Tooltip
              content={
                <div className="whitespace-pre font-mono">{errorMessage}</div>
              }
            >
              <MaterialSymbol
                className="!text-[16px] text-danger"
                icon="error"
              />
            </Tooltip>
          )}
        </div>
        <Button
          className={clsx(
            errorMessage ? 'border-2 border-danger' : '',
            className,
          )}
          label={value?.label ?? placeholder ?? ''}
          variant={variant}
          endIcon={<MaterialSymbol icon="arrow_drop_down" />}
        />
      </div>
    </Popover>
  );
}
