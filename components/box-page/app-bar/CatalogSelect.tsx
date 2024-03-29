import { SandboxObjectType } from '@algo-sandbox/components';
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
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Markdown, { Components } from 'react-markdown';
import { toast } from 'sonner';

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
  value?: O;
  onChange?: (value: O | null) => void;
  label: string;
  hideLabel?: boolean;
  variant?: ButtonProps['variant'];
  errorMessage?: string | null;
  showPreview?: boolean;
};

function ListItem<T>({
  active,
  selected,
  option,
  onClick,
  onDoubleClick,
}: {
  option: CatalogOption<T>;
  onClick?: () => void;
  onDoubleClick?: () => void;
  active: boolean;
  selected: boolean;
}) {
  return (
    <Button
      className={active ? 'font-semibold' : ''}
      label={option.label}
      selected={selected}
      role="checkbox"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    />
  );
}

export default function CatalogSelect<T extends SandboxObjectType>({
  options,
  containerClassName,
  className,
  label,
  hideLabel,
  variant = 'filled',
  value,
  onChange,
  errorMessage, // showPreview = true,
}: CatalogSelectProps<T>) {
  const [selectedOption, setSelectedOption] = useState(value);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const { mutateAsync: deleteObject } = useDeleteObjectMutation<T>();
  // const builtInComponents = useBuiltInComponents();
  const [query, setQuery] = useState('');
  // const [stepIndex, setStepIndex] = useState(0);

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
          <div className="flex flex-col border-r p-4 overflow-y-auto">
            <Input
              className="mb-4 sticky top-0"
              label="Search"
              type="search"
              hideLabel
              placeholder="Search..."
              value={query}
              onChange={handleQueryChange}
            />
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
              .filter((item) => !isSelectGroup(item) || item.options.length > 0)
              .map((item) => {
                if (isSelectGroup(item)) {
                  return (
                    <Fragment key={item.key}>
                      <div className="flex items-center pt-4 text-sm border-t">
                        <span className="border rounded-full flex items-center text-label px-2 font-semibold tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      {item.options.map((option) => (
                        <ListItem
                          selected={option.key === selectedOption?.key}
                          active={option.key === selectedOption?.key}
                          key={option.key}
                          option={option}
                          onClick={() => {
                            setSelectedOption?.(option);
                            // setStepIndex(0);
                          }}
                          onDoubleClick={() => {
                            onChange?.(option);
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
                      key={item.key}
                      option={item}
                      onClick={() => {
                        setSelectedOption?.(item);
                      }}
                      onDoubleClick={() => {
                        onChange?.(item);
                        setOpen(false);
                      }}
                    />
                  );
                }
              })}
          </div>
          {selectedOption !== undefined && (
            <div className="w-[250px] overflow-y-auto">
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
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    label="Select"
                    onClick={() => {
                      onChange?.(selectedOption);
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
                        onChange?.(null);
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
          label={value?.label ?? ''}
          variant={variant}
          endIcon={<MaterialSymbol icon="arrow_drop_down" />}
        />
      </div>
    </Popover>
  );
}
