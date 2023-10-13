import clsx from 'clsx';
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ForwardedRef,
  ReactElement,
  forwardRef,
} from 'react';
import { Tooltip } from '.';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'sm' | 'md';

export type ButtonProps = {
  label: string;
  hideLabel?: boolean;
  icon?: ReactElement;
  size?: ButtonSize;
  variant?: ButtonVariant;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

function Button(
  {
    label,
    className,
    icon,
    disabled,
    hideLabel,
    size = 'md',
    variant = 'tertiary',
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <Tooltip content={label} disabled={!hideLabel}>
      <button
        ref={ref}
        aria-label={hideLabel ? label : undefined}
        className={clsx(
          'flex items-center  rounded transition-colors',
          size === 'sm' && [
            'py-1 gap-1',
            icon !== undefined ? 'ps-1' : 'ps-2',
            hideLabel ? 'pe-1' : 'pe-2',
            '[&_.material-symbols-rounded]:text-[20px] text-sm',
          ],
          size === 'md' && [
            'py-2 gap-2',
            icon !== undefined ? 'ps-2' : 'ps-3',
            hideLabel ? 'pe-1' : 'pe-3',
          
          ],
          variant === 'tertiary' && [
            !disabled && 'hover:bg-primary-100 text-neutral-700',
            disabled && 'text-neutral-300',
          ],
          variant === 'secondary' && [
            !disabled && 'bg-neutral-100 hover:bg-primary-100 text-neutral-700',
            disabled && 'text-neutral-300 bg-neutral-100',
          ],
          variant === 'primary' && [
            'text-white',
            !disabled && 'bg-primary-500 hover:bg-primary-700',
            disabled && 'bg-neutral-300',
          ],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon}
        {!hideLabel && label}
      </button>
    </Tooltip>
  );
}

export default forwardRef(Button);
