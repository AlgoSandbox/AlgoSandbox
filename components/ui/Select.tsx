import * as RadixSelect from '@radix-ui/react-select';
import clsx from 'clsx';
import React, {
  ComponentPropsWithoutRef,
  ForwardedRef,
  forwardRef,
  useId,
  useMemo,
} from 'react';
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

export type SelectProps<T, O  extends SelectOption<T> = SelectOption<T>> = {
  className?: string;
  containerClassName?: string;
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: SelectOptions<T>;
  value?: O;
  onChange?: (value: O) => void;
};

export function isSelectGroup<T>(
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

function Select<T>(
  {
    className,
    containerClassName,
    label,
    hideLabel = false,
    placeholder,
    options,
    value,
    onChange,
  }: SelectProps<T>,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const id = useId();
  const flattenedOptions = useMemo(() => {
    return options.flatMap((item) =>
      isSelectGroup(item) ? item.options : [item]
    );
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
        ref={ref}
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={!hideLabel ? id : undefined}
        className={clsx(
          'flex items-center ps-4 pe-2 py-2 hover:bg-primary-100 bg-neutral-100 rounded transition-colors focus:outline-primary-500 text-neutral-700',
          '[&[data-placeholder]]:text-neutral-400',
          className,
          hideLabel && containerClassName
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon asChild>
          <MaterialSymbol className="text-neutral-700" icon="arrow_drop_down" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-primary-50 shadow rounded">
          <RadixSelect.ScrollUpButton />
          <RadixSelect.Viewport className="p-2">
            {options.map((item, index) =>
              isSelectGroup(item) ? (
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
    <div className={clsx('flex flex-col', containerClassName)}>
      <FormLabel id={id}>{label}</FormLabel>
      {selectElement}
    </div>
  );
}

export default forwardRef(Select) as typeof Select;
