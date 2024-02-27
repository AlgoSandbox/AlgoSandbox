import {
  getDefaultParameters,
  ParsedParameters,
  SandboxEvaluated,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';
import { ErrorOr } from '@app/errors/ErrorContext';
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
import _ from 'lodash';
import { Fragment, ReactElement, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import CatalogSelect from './app-bar/CatalogSelect';

export type AdapterListPopoverProps = {
  fromLabel: string;
  toLabel: string;
  fromType: SandboxStateType | null;
  toType: SandboxStateType | null;
  value: Array<CatalogOption<DbAdapterSaved>>;
  evaluated: Record<string, SandboxEvaluated<ErrorOr<SandboxAnyAdapter>>>;
  onChange: (value: Array<CatalogOption<DbAdapterSaved>>) => void;
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

type AdapterFormValue = {
  adapters: AdapterListPopoverProps['value'];
};

export default function AdapterListPopover({
  fromLabel,
  toLabel,
  fromType,
  toType,
  value,
  evaluated,
  onChange,
  options,
  children,
}: AdapterListPopoverProps) {
  // TODO: Show parameters in problem-algorithm adapter select popover
  const [parameters, setParameters] = useState<
    Record<string, ParsedParameters<SandboxParameters> | null>
  >({});

  const { control, watch, setValue } = useForm<AdapterFormValue>({
    values: {
      adapters: value,
    },
  });

  const { fields, insert, remove } = useFieldArray({
    control,
    name: 'adapters',
  });

  const rawAdapters = watch('adapters');

  const evaluations = useMemo(() => {
    return value.map(({ key }) => evaluated[key]);
  }, [evaluated, value]);

  const defaultParameters = useMemo(() => {
    return Object.fromEntries(
      evaluations.map((evaluation, index) => {
        const id = fields[index].id;

        return [
          id,
          evaluation.value.map((adapter) => {
            const defaultParams =
              'parameters' in adapter
                ? getDefaultParameters(adapter.parameters)
                : null;

            return defaultParams;
          }),
        ];
      }),
    );
  }, [fields, evaluations]);

  const instances = useMemo(() => {
    return evaluations.map(({ value: evaluation, key, name }, index) => {
      const id = fields[index].id;

      return evaluation.chain((adapter) => {
        return defaultParameters[id].map((defaultParams) => {
          const params = parameters[id] ?? defaultParams;
          const instance =
            'parameters' in adapter ? adapter.create(params ?? {}) : adapter;

          return { value: instance, name, key };
        });
      });
    });
  }, [defaultParameters, evaluations, fields, parameters]);

  const faultyAdapterIndex = useMemo(() => {
    let input = fromType;
    for (let i = 0; i < instances.length; i++) {
      const adapterInstance = instances[i];

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
  }, [fromType, instances]);

  const isLastAdapterFaulty = useMemo(() => {
    if (instances.length === 0) {
      return false;
    }
    const evaluation = instances[instances.length - 1];

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
  }, [instances, toType]);

  const isFaulty =
    faultyAdapterIndex !== null ||
    isLastAdapterFaulty ||
    fromType === null ||
    toType === null ||
    (evaluations.length === 0 &&
      !areStateTypesCompatible({ to: toType, from: fromType }));

  if (!_.isEqual(value, rawAdapters)) {
    onChange(rawAdapters);
  }

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
            {evaluations.length === 0 && (
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
                    insert(0, getFirstOption(options));
                  }}
                />
              </div>
            )}
            {fields.map((adapter, index) => {
              const isFaulty =
                faultyAdapterIndex !== null && index >= faultyAdapterIndex;
              return (
                <Fragment key={adapter.id}>
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
                            insert(index + 1, getFirstOption(options));
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
                    <Controller
                      control={control}
                      name={`adapters.${index}`}
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      render={({ field: { onChange: _, ...field } }) => (
                        <CatalogSelect
                          containerClassName="flex-1"
                          label="Adapter"
                          options={options}
                          onChange={(value) => {
                            setValue(`adapters.${index}` as const, value);
                          }}
                          showPreview={false}
                          {...field}
                        />
                      )}
                    />
                    <Button
                      className="mb-1.5"
                      label="Remove"
                      hideLabel
                      size="sm"
                      icon={<MaterialSymbol icon="delete" />}
                      onClick={() => {
                        remove(index);
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
                        insert(index + 1, getFirstOption(options));
                      }}
                      icon={<MaterialSymbol icon="add" />}
                    />
                  </div>
                </Fragment>
              );
            })}
          </ol>
          {evaluations.length > 0 && (
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
