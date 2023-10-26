import clsx from 'clsx';
import {
  DetailedHTMLProps,
  forwardRef,
  InputHTMLAttributes,
  useId,
} from 'react';

import { FormLabel } from '.';

export type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  containerClassName?: string;
  label: string;
  error?: string;
  hideLabel?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hideLabel = false,
      className,
      containerClassName,
      error,
      ...props
    },
    ref
  ) => {
    const id = useId();

    const inputElement = (
      <input
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={!hideLabel ? id : undefined}
        ref={ref}
        autoComplete="off"
        className={clsx(
          'bg-neutral-100 rounded px-4 py-2 focus:outline-primary-500',
          className,
          hideLabel && containerClassName
        )}
        {...props}
      />
    );

    return hideLabel && !error ? (
      inputElement
    ) : (
      <div className={clsx('flex flex-col', containerClassName)}>
        {!hideLabel && <FormLabel id={id}>{label}</FormLabel>}
        {inputElement}
        {error && <span className="text-red-700">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
