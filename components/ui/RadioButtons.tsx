'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import * as React from 'react';
import { useId } from 'react';

import { FormLabel, MaterialSymbol } from '.';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={clsx('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={clsx(
        'aspect-square h-4 w-4 rounded-full border-2 hover:border-accent transition-colors border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <MaterialSymbol className="!text-[14px] text-accent" icon="done" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

type RadioOption<T extends string> = {
  label: string;
  value: T;
};

export default function RadioButtons<T extends string>({
  label,
  value,
  onChange,
  disabled,
  hideLabel = false,
  options,
}: {
  label: string;
  value?: T;
  disabled?: boolean;
  onChange?: (value: T) => void;
  hideLabel?: boolean;
  options: Array<RadioOption<T>>;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <FormLabel id={id}>{label}</FormLabel>
      <RadioGroup
        disabled={disabled}
        aria-labelledby={hideLabel ? undefined : id}
        aria-label={hideLabel ? label : undefined}
        value={value}
        onValueChange={(value) => {
          onChange?.(value as T);
        }}
      >
        {options.map((option) => (
          <div key={option.value} className="flex gap-2 items-center">
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
            <FormLabel disabled={disabled} htmlFor={`${id}-${option.value}`}>
              {option.label}
            </FormLabel>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
