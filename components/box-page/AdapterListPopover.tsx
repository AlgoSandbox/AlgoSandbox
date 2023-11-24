import { SandboxAdapter, SandboxStateType } from '@algo-sandbox/core';
import {
  Button,
  isSelectGroup,
  MaterialSymbol,
  Popover,
  Select,
  SelectOption,
  SelectOptions,
} from '@components/ui';
import clsx from 'clsx';
import _ from 'lodash';
import { Fragment, ReactElement } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

export type AdapterListPopoverProps = {
  fromLabel: string;
  toLabel: string;
  fromType: SandboxStateType | null;
  toType: SandboxStateType | null;
  value: Array<
    SelectOption<SandboxAdapter<SandboxStateType, SandboxStateType>>
  >;
  onChange: (
    value: Array<
      SelectOption<SandboxAdapter<SandboxStateType, SandboxStateType>>
    >,
  ) => void;
  options: SelectOptions<SandboxAdapter<SandboxStateType, SandboxStateType>>;
  children: ReactElement;
};

function getFirstOption<T>(options: SelectOptions<T>): SelectOption<T> {
  if (isSelectGroup(options[0])) {
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

  const adapters = watch('adapters');

  const faultyAdapterIndex = (() => {
    let input = fromType;
    for (let i = 0; i < adapters.length; i++) {
      const adapter = adapters[i];
      if (adapter.value.accepts !== input) {
        return i;
      }
      input = adapter.value.outputs;
    }

    return null;
  })();

  const isLastAdapterFaulty =
    adapters.length > 0 &&
    adapters[adapters.length - 1].value.outputs !== toType;

  const isFaulty =
    faultyAdapterIndex !== null ||
    isLastAdapterFaulty ||
    (adapters.length === 0 && fromType !== toType);

  if (!_.isEqual(value, adapters)) {
    onChange(adapters);
  }

  return (
    <Popover
      content={
        <div className="min-w-[200px] p-2 flex flex-col gap-2 bg-white">
          <h1 className="p-2">Adapters</h1>
          <ol>
            <div className="flex gap-2 items-center font-mono text-xs text-primary-700">
              <MaterialSymbol icon="keyboard_double_arrow_down" />
              <div className="flex flex-col flex-1 px-2 py-1 bg-primary-100 rounded">
                <span className="font-medium font-sans">{fromLabel}</span>
                <span>{fromType?.name}</span>
              </div>
            </div>
            {adapters.length === 0 && (
              <div
                className={clsx(
                  fromType === toType
                    ? 'border-primary-500'
                    : 'border-neutral-400',
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
                          isFaulty
                            ? 'border-neutral-400'
                            : 'border-primary-500',
                          'ms-[11px] border-s-2 ps-3 h-5 transition-colors',
                        )}
                      />
                      <div
                        className={clsx(
                          isFaulty ? 'text-neutral-400' : 'text-primary-700',
                          'flex gap-2 items-center font-mono text-xs transition-colors',
                        )}
                      >
                        <MaterialSymbol icon="keyboard_double_arrow_down" />
                        <span className="flex-1 overflow-ellipsis overflow-hidden">
                          {adapters[index].value.accepts.name}
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
                      isFaulty ? 'border-neutral-400' : 'border-primary-500',
                      'flex gap-2 items-center ms-[11px] border-s-2 ps-[19px]',
                    )}
                  >
                    <Controller
                      control={control}
                      name={`adapters.${index}`}
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      render={({ field: { onChange: _, ...field } }) => (
                        <Select
                          placeholder="Select adapter"
                          containerClassName="flex-1"
                          hideLabel
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
                      isFaulty ? 'text-neutral-400' : 'text-primary-700',
                      'flex gap-2 items-center font-mono text-xs transition-colors',
                    )}
                  >
                    <MaterialSymbol icon="keyboard_double_arrow_down" />
                    <span className="flex-1 overflow-ellipsis overflow-hidden">
                      {adapters[index].value.outputs.name}
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
          {adapters.length > 0 && (
            <div
              className={clsx(
                isFaulty ? 'border-neutral-400' : 'border-primary-500',
                'ms-[11px] border-s-2 ps-3 h-5 transition-colors',
              )}
            />
          )}
          <div
            className={clsx(
              isFaulty ? 'text-neutral-400' : 'text-primary-700',
              'flex gap-2 items-center font-mono text-xs transition-colors',
            )}
          >
            <MaterialSymbol icon="keyboard_double_arrow_down" />
            <div
              className={clsx(
                isFaulty ? 'bg-neutral-100' : 'bg-primary-100',
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
