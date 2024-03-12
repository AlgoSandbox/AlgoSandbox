'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import clsx from 'clsx';
import { useId } from 'react';

import { MaterialSymbol } from '.';

type CheckboxProps = {
  className?: string;
  label: string;
  checked?: boolean | 'indeterminate';
  onChange?: (checked: boolean) => void;
  onFocus?: () => void;
};

export default function Checkbox({
  className,
  label,
  checked = false,
  onChange,
  onFocus,
}: CheckboxProps) {
  const id = useId();
  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        id={id}
        onFocusCapture={onFocus}
        checked={checked}
        onCheckedChange={onChange}
        className={clsx(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary hover:border-accent shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-on-primary  data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-on-primary',
          className,
        )}
      >
        <CheckboxPrimitive.Indicator
          className={clsx('flex items-center justify-center text-current')}
        >
          <MaterialSymbol
            icon={
              checked === 'indeterminate'
                ? 'check_indeterminate_small'
                : 'check'
            }
            className="!text-[16px] h-4 w-4"
          />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}
