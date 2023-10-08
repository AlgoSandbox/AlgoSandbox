import clsx from 'clsx';
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  forwardRef,
  useId,
} from 'react';
import { FormLabel } from '.';

export type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: string;
  hideLabel?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hideLabel = false, className, ...props }, ref) => {
    const id = useId();

    const inputElement = (
      <input
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={!hideLabel ? id : undefined}
        ref={ref}
        autoComplete="off"
        className={clsx(
          'bg-neutral-100 rounded px-4 py-2 focus:outline-primary-500',
          className
        )}
        {...props}
      />
    );

    return hideLabel ? (
      inputElement
    ) : (
      <div className="flex flex-col">
        {!hideLabel && <FormLabel id={id}>{label}</FormLabel>}
        {inputElement}
      </div>
    );
  }
);

export default Input;
