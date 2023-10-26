import VisualizationRenderer from '@algo-sandbox/components/VisualizationRenderer';
import { Box } from '@algo-sandbox/core';
import {
  Button,
  FormLabel,
  Input,
  isSelectGroup,
  MaterialSymbol,
  Popover,
} from '@components/ui';
import { CatalogOption, CatalogOptions } from '@constants/catalog';
import {
  createScene,
  isParameteredAlgorithm,
  isParameteredProblem,
  isParameteredVisualizer,
} from '@utils';
import { DbSandboxObjectSaved } from '@utils/db';
import evalWithAlgoSandbox from '@utils/evalWithAlgoSandbox';
import useCancelableInterval from '@utils/useCancelableInterval';
import { Fragment, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';

const MAX_EXECUTION_STEP_COUNT = 20;

export type CatalogSelectProps<
  T,
  O extends CatalogOption<T> = CatalogOption<T>,
> = {
  className?: string;
  containerClassName?: string;
  options: CatalogOptions<T>;
  value?: O;
  onChange?: (value: O) => void;
  label: string;
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

export default function CatalogSelect<T extends DbSandboxObjectSaved>({
  options,
  label,
  value,
  onChange,
}: CatalogSelectProps<T>) {
  const [selectedOption, setSelectedOption] = useState<CatalogOption<T> | null>(
    value ?? null
  );
  const [query, setQuery] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setSelectedOption(value ?? null);
  }, [value]);

  const { executionTrace, visualizerInstance } =
    useMemo(() => {
      if (selectedOption === null) {
        return;
      }

      const {
        value: { files },
      } = selectedOption;

      if (!files) {
        return;
      }

      const defaultBoxFilePath = Object.keys(files).find((path) =>
        path.includes('default-box.ts')
      );

      if (defaultBoxFilePath === undefined || !(defaultBoxFilePath in files)) {
        return;
      }

      const defaultBoxCode = files[defaultBoxFilePath];

      if (defaultBoxCode === undefined) {
        return;
      }

      const defaultBox = evalWithAlgoSandbox(defaultBoxCode, {
        files,
        currentFilePath: defaultBoxFilePath,
      }) as Box;

      const { algorithm, problem, visualizer } = defaultBox;

      const problemInstance = (() => {
        if (isParameteredProblem(problem)) {
          return problem.create();
        }

        return problem;
      })();

      const algorithmInstance = (() => {
        if (isParameteredAlgorithm(algorithm)) {
          return algorithm.create();
        }

        return algorithm;
      })();

      const visualizerInstance = (() => {
        if (isParameteredVisualizer(visualizer)) {
          return visualizer.create();
        }

        return visualizer;
      })();

      const scene = createScene({
        algorithm: algorithmInstance,
        problem: problemInstance,
      });

      return {
        executionTrace: scene.copyWithExecution(MAX_EXECUTION_STEP_COUNT)
          .executionTrace,
        visualizerInstance,
      };
    }, [selectedOption]) ?? {};

  const stepCount = Math.min(
    MAX_EXECUTION_STEP_COUNT,
    executionTrace?.length ?? MAX_EXECUTION_STEP_COUNT
  );

  const interval = useCancelableInterval(() => {
    setStepIndex((stepIndex) => (stepIndex + 1) % stepCount);
  }, 300);

  useEffect(() => {
    if (!interval.isRunning && selectedOption !== null) interval.start();
  }, [interval, selectedOption]);

  const visualization = useMemo(() => {
    if (visualizerInstance && executionTrace) {
      try {
        const step = executionTrace.at(stepIndex);
        if (step === undefined) {
          return undefined;
        }

        return visualizerInstance.visualize(step.state);
      } catch {
        return undefined;
      }
    }
  }, [executionTrace, stepIndex, visualizerInstance]);

  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div className="flex bg-white h-[400px]">
          <div className="flex flex-col border-r p-4 overflow-y-auto">
            <Input
              className="mb-4 sticky top-0"
              label="Search"
              type="search"
              hideLabel
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
            {options
              .map((item) => {
                if (isSelectGroup(item)) {
                  return {
                    ...item,
                    options: item.options.filter(item => query === '' ||
                    item.label
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase()) )
                  }
                }
                return item;
              })
              .filter(
                (item) =>
                  query === '' ||
                  item.label
                    .toLocaleLowerCase()
                    .includes(query.toLocaleLowerCase()) || isSelectGroup(item)
              )
              .filter(
                (item) =>
                  !isSelectGroup(item) || item.options.length > 0
              )
              .map((item) => {
                if (isSelectGroup(item)) {
                  return (
                    <Fragment key={item.key}>
                      <span className="text-neutral-400 border-t pt-2 font-mono px-3">
                        {item.label}
                      </span>
                      {item.options.map((option) => (
                        <ListItem
                          selected={option.key === selectedOption?.key}
                          active={option.key === value?.key}
                          key={option.key}
                          option={option}
                          onClick={() => {
                            setSelectedOption(option);
                            setStepIndex(0);
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
                      active={item.key === value?.key}
                      key={item.key}
                      option={item}
                      onClick={() => {
                        setSelectedOption(item);
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
          {selectedOption !== null && (
            <div>
              {visualization && (
                <div className="w-[250px] h-[200px] rounded-tr-md bg-neutral-100 overflow-clip">
                  <div className="w-[250px] h-[200px] scale-50">
                    <VisualizationRenderer
                      className="w-[500px] h-[400px] overflow-visible"
                      visualization={visualization}
                    />
                  </div>
                </div>
              )}
              {!visualization && (
                <div className="w-[250px] h-[200px] rounded-tr-md bg-neutral-100 flex justify-center items-center">
                  <span className="text-neutral-400">No preview available</span>
                </div>
              )}
              <div className="p-4 flex-col flex gap-2 items-start">
                <Markdown
                  components={{
                    h1: (props) => (
                      <h1 className="text-lg font-semibold" {...props} />
                    ),
                  }}
                >
                  {selectedOption.value.writeup ?? `# ${selectedOption.label}`}
                </Markdown>
                <Button
                  variant="primary"
                  label="Select"
                  onClick={() => {
                    onChange?.(selectedOption);
                    setOpen(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="flex flex-col">
        <FormLabel>{label}</FormLabel>
        <Button
          label={value?.label ?? ''}
          variant="secondary"
          endIcon={<MaterialSymbol icon="arrow_drop_down" />}
        />
      </div>
    </Popover>
  );
}
