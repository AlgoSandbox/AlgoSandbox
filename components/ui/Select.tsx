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

type SelectVariant = 'primary' | 'filled' | 'flat';

export type SelectOption<T, K extends string = string> = Readonly<{
  key: K;
  label: string;
  value: T;
}>;

export type SelectGroup<T, K extends string = string> = Readonly<{
  key: string;
  label: string;
  options: ReadonlyArray<SelectOption<T, K>>;
}>;

export type SelectOptions<
  T = unknown,
  K extends string = string,
> = ReadonlyArray<SelectOption<T, K> | SelectGroup<T, K>>;

export type SelectProps<
  T,
  K extends string,
  Options extends SelectOptions<T, K> = SelectOptions<T, K>,
> = {
  className?: string;
  containerClassName?: string;
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: Options;
  value?: K;
  variant?: SelectVariant;
  disabled?: boolean;
  onChange?: (value: SelectOption<T, K>) => void;
};

export function isSelectGroup<T, K extends string>(
  option: SelectOption<T, K> | SelectGroup<T, K>,
): option is SelectGroup<T, K> {
  return (option as SelectGroup<T, K>).options !== undefined;
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <RadixSelect.Item
      className={clsx(
        className,
        'px-8 py-1 [&[data-highlighted]]:bg-surface-higher [&[data-highlighted]]:text-on-surface/80 font-medium rounded outline-none select-none relative',
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

function Select<T, K extends string>(
  {
    className,
    containerClassName,
    label,
    hideLabel = false,
    placeholder,
    options,
    value,
    disabled,
    variant = 'flat',
    onChange,
  }: SelectProps<T, K>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const id = useId();
  const flattenedOptions = useMemo(() => {
    return options.flatMap((item) =>
      isSelectGroup(item) ? item.options : [item],
    );
  }, [options]);

  const selectElement = (
    <RadixSelect.Root
      disabled={disabled}
      value={value}
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
          variant === 'flat' && [
            'border',
            !disabled && [
              'data-[state=closed]:hover:bg-surface-high data-[state=closed]:border-transparent data-[state=closed]:text-on-surface/80 data-[state=closed]:focus-visible:outline-accent',
              'data-[state=open]:hover:bg-surface-high data-[state=open]:border-accent data-[state=open]:focus-visible:outline-accent',
            ],
            disabled && 'text-muted border-transparent',
          ],
          variant === 'filled' && [
            'border',
            !disabled && [
              'bg-surface-high hover:bg-surface-higher focus-visible:outline-accent',
              'data-[state=closed]:text-on-surface/80',
              'data-[state=open]:border-accent data-[state=open]:text-accent',
            ],
            disabled && 'text-muted bg-surface/50',
          ],
          variant === 'primary' && [
            !disabled &&
              'text-accent border hover:border-accent focus-visible:outline-accent bg-surface-high transition-all hover:bg-surface-higher',
            disabled && 'border bg-canvas text-muted',
          ],
          'flex items-center ps-4 pe-2 py-2 hover:bg-surface-higher bg-surface-high rounded transition-colors text-on-surface/80 font-medium',
          '[&[data-placeholder]]:text-hint',
          className,
          hideLabel && containerClassName,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon asChild>
          <MaterialSymbol className="text-label" icon="arrow_drop_down" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="bg-surface-high shadow rounded z-50">
          <RadixSelect.ScrollUpButton />
          <RadixSelect.Viewport className="p-2">
            {options.map((item, index) =>
              isSelectGroup(item) ? (
                <React.Fragment key={item.key}>
                  {index > 0 && (
                    <RadixSelect.Separator className="h-px bg-border my-2" />
                  )}
                  <RadixSelect.Group>
                    <RadixSelect.Label className="ps-8 pe-2 text-label">
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
              ),
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
      <FormLabel className="truncate text-ellipsis shrink" id={id}>
        {label}
      </FormLabel>
      {selectElement}
    </div>
  );
}

export default forwardRef(Select) as typeof Select;
