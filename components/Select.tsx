import * as RadixSelect from '@radix-ui/react-select';
import clsx from 'clsx';
import React, { ComponentPropsWithoutRef, useId, useMemo } from 'react';
import { FormLabel, MaterialSymbol } from '.';

export type SelectOption<T> = {
  key: string;
  label: string;
  value: T;
};

export type SelectGroup<T> = {
  key: string;
  label: string;
  options: Array<SelectOption<T>>;
};

export type SelectOptions<T = any> = Array<SelectOption<T> | SelectGroup<T>>;

export type SelectProps<T> = {
  label: string;
  hideLabel?: boolean;
  options: SelectOptions<T>;
  value?: SelectOption<T>;
  onChange?: (value: SelectOption<T>) => void;
};

function isGroup<T>(
  option: SelectOption<T> | SelectGroup<T>
): option is SelectGroup<T> {
  return (option as SelectGroup<T>).options !== undefined;
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Item
      className={clsx(
        'className',
        'px-8 py-1 [&[data-highlighted]]:bg-primary-500 [&[data-highlighted]]:text-white rounded outline-none select-none relative'
      )}
      {...props}
      ref={forwardedRef}
    >
      <RadixSelect.ItemIndicator className="absolute left-2 top-0 flex items-center h-full">
        <MaterialSymbol icon="check" className="!text-[16px]" />
      </RadixSelect.ItemIndicator>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});

SelectItem.displayName = 'SelectItem';

export default function Select<T>({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
}: SelectProps<T>) {
  const id = useId();
  const flattenedOptions = useMemo(() => {
    return options.flatMap((item) => (isGroup(item) ? item.options : [item]));
  }, [options]);

  const selectElement = (
    <RadixSelect.Root
      value={value?.key}
      onValueChange={(key) => {
        const newValue = flattenedOptions.find((option) => option.key === key);
        if (newValue) {
          onChange?.(newValue);
        }
      }}
    >
      <RadixSelect.Trigger
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={!hideLabel ? id : undefined}
        className={
          'flex items-center ps-4 pe-2 py-2 hover:bg-primary-100 bg-neutral-100 rounded transition-colors focus:outline-primary-500 text-neutral-700'
        }
      >
        <RadixSelect.Value />
        <RadixSelect.Icon asChild>
          <MaterialSymbol icon="arrow_drop_down" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-primary-50 shadow rounded">
          <RadixSelect.ScrollUpButton />
          <RadixSelect.Viewport className="p-2">
            {options.map((item, index) =>
              isGroup(item) ? (
                <React.Fragment key={item.key}>
                  {index > 0 && (
                    <RadixSelect.Separator className="h-px bg-neutral-300 my-2" />
                  )}
                  <RadixSelect.Group>
                    <RadixSelect.Label className="ps-8 pe-2 text-neutral-500">
                      {item.label}
                    </RadixSelect.Label>
                    {item.options.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </RadixSelect.Group>
                </React.Fragment>
              ) : (
                <SelectItem key={item.key} value={item.key}>
                  {item.label}
                </SelectItem>
              )
            )}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton />
          <RadixSelect.Arrow />
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );

  return hideLabel ? (
    selectElement
  ) : (
    <div className="flex flex-col">
      <FormLabel id={id}>{label}</FormLabel>
      {selectElement}
    </div>
  );
}
