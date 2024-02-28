import {
  getDefaultParameters,
  SandboxEvaluated,
  SandboxStateType,
} from '@algo-sandbox/core';
import { ErrorOr, success } from '@app/errors/ErrorContext';
import { Button, MaterialSymbol, Popover } from '@components/ui';
import {
  CatalogGroup,
  CatalogOption,
  CatalogOptions,
} from '@constants/catalog';
import { SandboxAnyAdapter } from '@typings/algo-sandbox';
import areStateTypesCompatible from '@utils/areStateTypesCompatible';
import { DbAdapterSaved } from '@utils/db';
import clsx from 'clsx';
import _, { compact, mapValues } from 'lodash';
import { Fragment, ReactElement, useCallback, useMemo } from 'react';

import ComponentSelect from './app-bar/ComponentSelect';

export type AdapterListPopoverProps = {
  fromLabel: string;
  toLabel: string;
  fromType: SandboxStateType | null;
  toType: SandboxStateType | null;
  config: {
    adapters: Record<string, CatalogOption<DbAdapterSaved>>;
    order: Array<string>;
    parameters: Record<string, Record<string, unknown> | undefined>;
  };
  evaluations: Record<string, SandboxEvaluated<ErrorOr<SandboxAnyAdapter>>>;
  onConfigChange: (value: {
    adapters: Record<string, CatalogOption<DbAdapterSaved>>;
    order: Array<string>;
    parameters: Record<string, Record<string, unknown> | undefined>;
  }) => void;
  options: CatalogOptions<DbAdapterSaved>;
  children: ReactElement;
};

function isCatalogGroup<T>(
  option: CatalogGroup<T> | CatalogOption<T>,
): option is CatalogGroup<T> {
  return 'options' in option;
}

function getFirstOption<T>(options: CatalogOptions<T>): CatalogOption<T> {
  if (isCatalogGroup(options[0])) {
    return options[0].options[0];
  } else {
    return options[0];
  }
}

export default function AdapterListPopover({
  fromLabel,
  toLabel,
  fromType,
  toType,
  evaluations,
  config,
  onConfigChange,
  options,
  children,
}: AdapterListPopoverProps) {
  const adapters = useMemo(() => {
    return config.order.map((alias) => ({
      alias,
      adapter: config.adapters[alias],
      parameters: config.parameters[alias],
    }));
  }, [config]);

  const defaultParameters = useMemo(() => {
    return mapValues(evaluations, (evaluation) => {
      return evaluation.value.map((adapter) => {
        const defaultParams =
          'parameters' in adapter
            ? getDefaultParameters(adapter.parameters)
            : null;

        return defaultParams;
      });
    });
  }, [evaluations]);

  const instances = useMemo(() => {
    return mapValues(evaluations, ({ value: evaluation, key, name }, alias) => {
      return evaluation.chain((adapter) => {
        return defaultParameters[alias].map((defaultParams) => {
          const params = config.parameters[alias] ?? defaultParams;
          const instance =
            'parameters' in adapter ? adapter.create(params ?? {}) : adapter;

          return { value: instance, name, key };
        });
      });
    });
  }, [config.parameters, defaultParameters, evaluations]);

  const orderedInstances = useMemo(() => {
    return compact(
      config.order.map((alias) => {
        return instances[alias];
      }),
    );
  }, [config.order, instances]);

  const faultyAdapterIndex = useMemo(() => {
    let input = fromType;
    for (let i = 0; i < orderedInstances.length; i++) {
      const adapterInstance = orderedInstances[i];

      if (adapterInstance.isLeft()) {
        return i;
      }

      const { value: adapter } = adapterInstance.unwrap();

      if (input === null) {
        return i;
      }

      if (
        !areStateTypesCompatible({
          to: adapter.accepts,
          from: input,
        })
      ) {
        return i;
      }
      input = adapter.outputs;
    }

    return null;
  }, [fromType, orderedInstances]);

  const isLastAdapterFaulty = useMemo(() => {
    if (orderedInstances.length === 0) {
      return false;
    }
    const evaluation = orderedInstances[orderedInstances.length - 1];

    if (evaluation.isLeft()) {
      return true;
    }

    if (toType === null) {
      return true;
    }

    const { value: adapter } = evaluation.unwrap();

    return !areStateTypesCompatible({
      to: toType,
      from: adapter.outputs,
    });
  }, [orderedInstances, toType]);

  const isFaulty =
    faultyAdapterIndex !== null ||
    isLastAdapterFaulty ||
    fromType === null ||
    toType === null ||
    (Object.keys(adapters).length === 0 &&
      !areStateTypesCompatible({ to: toType, from: fromType }));

  const insertAdapter = useCallback(
    (
      index: number,
      entry: {
        alias: string;
        adapter: CatalogOption<DbAdapterSaved>;
        parameters?: Record<string, unknown> | undefined;
      },
    ) => {
      const newOrder = config.order;
      newOrder.splice(index, 0, entry.alias);
      onConfigChange({
        adapters: {
          ...config.adapters,
          [entry.alias]: entry.adapter,
        },
        order: newOrder,
        parameters: {
          ...config.parameters,
          [entry.alias]: entry.parameters,
        },
      });
    },
    [config.adapters, config.order, config.parameters, onConfigChange],
  );

  const removeAdapter = useCallback(
    (index: number) => {
      const newOrder = config.order;
      newOrder.splice(index, 1);
      onConfigChange({
        adapters: _.omit(config.adapters, adapters[index].alias),
        order: newOrder,
        parameters: _.omit(config.parameters, adapters[index].alias),
      });
    },
    [
      adapters,
      config.adapters,
      config.order,
      config.parameters,
      onConfigChange,
    ],
  );

  const setAdapter = useCallback(
    (entry: {
      alias: string;
      adapter: CatalogOption<DbAdapterSaved>;
      parameters?: Record<string, unknown> | undefined;
    }) => {
      onConfigChange({
        adapters: {
          ...config.adapters,
          [entry.alias]: entry.adapter,
        },
        order: config.order,
        parameters: {
          ...config.parameters,
          [entry.alias]: entry.parameters,
        },
      });
    },
    [config.adapters, config.order, config.parameters, onConfigChange],
  );

  const getKey = (index: number = 0): string => {
    const key = `adapter-${index}`;
    if (config.order.includes(key)) {
      return getKey(index + 1);
    }
    return key;
  };

  return (
    <Popover
      content={
        <div className="min-w-[200px] p-2 flex flex-col gap-2 bg-surface">
          <h1 className="p-2 font-medium">Adapters</h1>
          <ol>
            <div className="flex gap-2 items-center font-mono text-xs text-primary">
              <MaterialSymbol icon="keyboard_double_arrow_down" />
              <div className="flex flex-col flex-1 px-2 py-1 bg-primary/10 rounded">
                <span className="font-medium font-sans">{fromLabel}</span>
                <span>{fromType?.name}</span>
              </div>
            </div>
            {Object.keys(evaluations).length === 0 && (
              <div
                className={clsx(
                  fromType === toType ? 'border-primary' : 'border-border',
                  'ms-[11px] border-s-2 ps-[19px] py-2 transition-colors',
                )}
              >
                <Button
                  label="Insert adapter"
                  icon={<MaterialSymbol icon="add" />}
                  size="sm"
                  onClick={() => {
                    insertAdapter(0, {
                      alias: getKey(),
                      adapter: getFirstOption(options),
                    });
                  }}
                />
              </div>
            )}
            {config.order.map((alias, index) => {
              const adapter = config.adapters[alias];
              const parameters = config.parameters[alias];
              const isFaulty =
                faultyAdapterIndex !== null && index >= faultyAdapterIndex;
              return (
                <Fragment key={alias}>
                  {index === 0 && (
                    <>
                      <div
                        className={clsx(
                          isFaulty ? 'border-muted/10' : 'border-primary',
                          'ms-[11px] border-s-2 ps-3 h-5 transition-colors',
                        )}
                      />
                      <div
                        className={clsx(
                          isFaulty ? 'text-muted' : 'text-primary',
                          'flex gap-2 items-center font-mono text-xs transition-colors',
                        )}
                      >
                        <MaterialSymbol icon="keyboard_double_arrow_down" />
                        <span className="flex-1 overflow-ellipsis overflow-hidden">
                          {instances[index]
                            ?.map(({ value: adapter }) => adapter.accepts.name)
                            .unwrapOr('')}
                        </span>
                        <Button
                          label="Insert adapter"
                          size="sm"
                          hideLabel
                          onClick={() => {
                            insertAdapter(index + 1, {
                              alias: getKey(),
                              adapter: getFirstOption(options),
                            });
                          }}
                          icon={<MaterialSymbol icon="add" />}
                        />
                      </div>
                    </>
                  )}
                  <li
                    className={clsx(
                      isFaulty ? 'border-muted' : 'border-primary',
                      'flex gap-2 items-end ms-[11px] border-s-2 ps-[19px]',
                    )}
                  >
                    <ComponentSelect<'adapter'>
                      className="flex-1"
                      label="Adapter"
                      options={options}
                      onChange={(adapter) => {
                        if (adapter === null) {
                          setAdapter({
                            alias,
                            adapter: getFirstOption(options),
                            parameters: undefined,
                          });
                          return;
                        }

                        setAdapter({
                          alias,
                          adapter,
                          parameters: undefined,
                        });
                      }}
                      value={adapter}
                      defaultParameters={defaultParameters[alias]}
                      parameters={parameters ?? null}
                      setParameters={(parameters) => {
                        setAdapter({
                          alias,
                          adapter,
                          parameters,
                        });
                      }}
                      evaluatedValue={
                        evaluations[alias]?.value ?? success(null)
                      }
                    />
                    <Button
                      className="mb-1.5"
                      label="Remove"
                      hideLabel
                      size="sm"
                      icon={<MaterialSymbol icon="delete" />}
                      onClick={() => {
                        removeAdapter(index);
                      }}
                    />
                  </li>
                  <div
                    className={clsx(
                      isFaulty ? 'text-muted' : 'text-primary',
                      'flex gap-2 items-center font-mono text-xs transition-colors',
                    )}
                  >
                    <MaterialSymbol icon="keyboard_double_arrow_down" />
                    <span className="flex-1 overflow-ellipsis overflow-hidden">
                      {instances[index]
                        ?.map(({ value: adapter }) => adapter.accepts.name)
                        .unwrapOr('')}
                    </span>
                    <Button
                      label="Insert adapter"
                      hideLabel
                      size="sm"
                      onClick={() => {
                        insertAdapter(index + 1, {
                          alias: getKey(),
                          adapter: getFirstOption(options),
                        });
                      }}
                      icon={<MaterialSymbol icon="add" />}
                    />
                  </div>
                </Fragment>
              );
            })}
          </ol>
          {Object.keys(evaluations).length > 0 && (
            <div
              className={clsx(
                isFaulty ? 'border-muted' : 'border-primary',
                'ms-[11px] border-s-2 ps-3 h-5 transition-colors',
              )}
            />
          )}
          <div
            className={clsx(
              isFaulty ? 'text-muted' : 'text-primary',
              'flex gap-2 items-center font-mono text-xs transition-colors',
            )}
          >
            <MaterialSymbol icon="keyboard_double_arrow_down" />
            <div
              className={clsx(
                isFaulty ? 'bg-muted/10' : 'bg-primary/10',
                'flex flex-col flex-1 px-2 py-1 rounded',
              )}
            >
              <span className="font-medium font-sans">{toLabel}</span>
              <span>{toType?.name}</span>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
