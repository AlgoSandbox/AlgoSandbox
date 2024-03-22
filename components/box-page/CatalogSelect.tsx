import { SandboxObjectType } from '@algo-sandbox/components';
import { getDefaultParameters, SandboxParameters } from '@algo-sandbox/core';
import {
  Button,
  FormLabel,
  Input,
  isSelectGroup,
  MaterialSymbol,
  Popover,
  Tooltip,
} from '@components/ui';
import { ButtonProps } from '@components/ui/Button';
import { CatalogOption, CatalogOptions } from '@constants/catalog';
import { DbSandboxObjectSaved } from '@utils/db';
import { useDeleteObjectMutation } from '@utils/db/objects';
import evalSavedObject from '@utils/eval/evalSavedObject';
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Markdown, { Components } from 'react-markdown';
import { toast } from 'sonner';

import { ParameterControls } from '.';

// TODO: Restore preview

const markdownComponents: Components = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h1: ({ node, ...props }) => (
    <h1 className="text-lg font-semibold" {...props} />
  ),
};

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

function Chip({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <span
      className={clsx(
        'border rounded-full flex items-center px-2 font-semibold tracking-tight',
        disabled ? 'text-muted' : 'text-label',
      )}
    >
      {children}
    </span>
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
  showParameters = false, // showPreview = true,
}: CatalogSelectProps<T>) {
  const [selectedOption, setSelectedOption] = useState(value);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const { mutateAsync: deleteObject } = useDeleteObjectMutation<T>();
  // const builtInComponents = useBuiltInComponents();
  const [query, setQuery] = useState('');
  // const [stepIndex, setStepIndex] = useState(0);

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

  // const { executionTrace, visualizerInstance } =
  //   useMemo(() => {
  //     if (selectedOption === null) {
  //       return;
  //     }

  //     if (!showPreview) {
  //       return;
  //     }

  //     const {
  //       value: { files },
  //     } = selectedOption;

  //     if (!files) {
  //       return;
  //     }

  //     const defaultBoxFilePath = Object.keys(files).find((path) =>
  //       path.includes('default-box.ts'),
  //     );

  //     if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
  //       return;
  //     }

  //     const defaultBoxCode = files[defaultBoxFilePath];

  //     if (defaultBoxCode === undefined) {
  //       return;
  //     }

  //     const defaultBox = evalWithAlgoSandbox(defaultBoxCode, {
  //       files,
  //       currentFilePath: defaultBoxFilePath,
  //     }) as SandboxBox;

  //     const evaledBox = evalBox({
  //       box: defaultBox,
  //       builtInComponents,
  //       currentFilePath: defaultBoxFilePath,
  //       files,
  //     });

  //     const { algorithm, problem, visualizer } = evaledBox;

  //     if (
  //       algorithm === undefined ||
  //       problem === undefined ||
  //       visualizer === undefined
  //     ) {
  //       return;
  //     }

  //     const problemInstance = (() => {
  //       if (isParameterizedProblem(problem)) {
  //         return problem.create();
  //       }

  //       return problem;
  //     })();

  //     const algorithmInstance = (() => {
  //       if (isParameterizedAlgorithm(algorithm)) {
  //         return algorithm.create();
  //       }

  //       return algorithm;
  //     })();

  //     const visualizerInstance = (() => {
  //       if (isParameterizedVisualizer(visualizer)) {
  //         return visualizer.create();
  //       }

  //       return visualizer;
  //     })();

  //     const scene = createScene({
  //       algorithm: algorithmInstance,
  //       problem: problemInstance,
  //     });

  //     return {
  //       executionTrace: scene.copyWithExecution(MAX_EXECUTION_STEP_COUNT)
  //         .executionTrace,
  //       visualizerInstance,
  //     };
  //   }, [builtInComponents, selectedOption, showPreview]) ?? {};

  // const stepCount = Math.min(
  //   MAX_EXECUTION_STEP_COUNT,
  //   executionTrace?.length ?? MAX_EXECUTION_STEP_COUNT,
  // );

  // const interval = useCancelableInterval(() => {
  //   setStepIndex((stepIndex) => (stepIndex + 1) % stepCount);
  // }, 300);

  // useEffect(() => {
  //   if (!interval.isRunning && selectedOption !== null) interval.start();
  // }, [interval, selectedOption]);

  // const visualization = useMemo(() => {
  //   if (visualizerInstance && executionTrace) {
  //     try {
  //       const step = executionTrace.at(stepIndex);
  //       if (step === undefined) {
  //         return undefined;
  //       }

  //       return visualizerInstance.visualize(step.state);
  //     } catch {
  //       return undefined;
  //     }
  //   }
  // }, [executionTrace, stepIndex, visualizerInstance]);

  const [open, setOpen] = useState(false);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div className="flex bg-surface h-[400px]">
          <div className="flex flex-col border-r overflow-y-hidden">
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
                            key={option.key}
                            option={option}
                            onClick={() => {
                              setSelectedOption?.(option);
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
          {selectedOption !== undefined && (
            <div className="w-[300px] overflow-y-auto">
              {/* {visualization && (
                <div className="w-[250px] h-[200px] rounded-tr-md bg-canvas border-b overflow-clip">
                  <div className="w-[250px] h-[200px]">
                    <VisualizationRenderer
                      className="w-[250px] h-[200px] overflow-visible"
                      visualization={visualization}
                      zoomLevel={0.5}
                    />
                  </div>
                </div>
              )}
              {!visualization && showPreview && (
                <div className="w-[250px] h-[200px] rounded-tr-md bg-canvas flex border-b justify-center items-center">
                  <span className="text-label">No preview available</span>
                </div>
              )} */}
              <div className="p-4 flex-col flex gap-2 items-start">
                <Markdown components={markdownComponents}>
                  {selectedOption.value.writeup ?? `# ${selectedOption.label}`}
                </Markdown>
                <div className="flex gap-2 flex-wrap">
                  {selectedOption.value.tags.map((tag) => (
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
                        setOpen(false);
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
