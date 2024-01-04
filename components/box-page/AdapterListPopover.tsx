import { SandboxStateType } from '@algo-sandbox/core';
import { Button, MaterialSymbol, Popover } from '@components/ui';
import {
  CatalogGroup,
  CatalogOption,
  CatalogOptions,
} from '@constants/catalog';
import { DbAdapterSaved } from '@utils/db';
import { DbObjectEvaluation } from '@utils/evalSavedObject';
import clsx from 'clsx';
import _ from 'lodash';
import { Fragment, ReactElement } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import CatalogSelect from './app-bar/CatalogSelect';

export type AdapterListPopoverProps = {
  fromLabel: string;
  toLabel: string;
  fromType: SandboxStateType | null;
  toType: SandboxStateType | null;
  value: Array<CatalogOption<DbAdapterSaved>>;
  valueEvaluated: Array<DbObjectEvaluation<'adapter'>>;
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
  valueEvaluated,
  onChange,
  options,
  children,
}: AdapterListPopoverProps) {
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

  const faultyAdapterIndex = (() => {
    let input = fromType;
    for (let i = 0; i < valueEvaluated.length; i++) {
      const { objectEvaled: adapter } = valueEvaluated[i];

      if (adapter === null) {
        return i;
      }

      if (adapter.accepts.name !== input?.name) {
        return i;
      }
      input = adapter.outputs;
    }

    return null;
  })();

  const isLastAdapterFaulty =
    valueEvaluated.length > 0 &&
    (valueEvaluated[valueEvaluated.length - 1].objectEvaled === null ||
      valueEvaluated[valueEvaluated.length - 1].objectEvaled?.outputs.name !==
        toType?.name);

  const isFaulty =
    faultyAdapterIndex !== null ||
    isLastAdapterFaulty ||
    (valueEvaluated.length === 0 && fromType?.name !== toType?.name);

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
            {valueEvaluated.length === 0 && (
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
                          {valueEvaluated[index].objectEvaled?.accepts.name}
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
                      'flex gap-2 items-center ms-[11px] border-s-2 ps-[19px]',
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
                          {...field}
                        />
                      )}
                    />
                    <Button
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
                      {valueEvaluated[index].objectEvaled?.outputs.name}
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
          {valueEvaluated.length > 0 && (
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
