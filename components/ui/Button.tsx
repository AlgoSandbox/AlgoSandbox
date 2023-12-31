import clsx from 'clsx';
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  ReactElement,
} from 'react';

import { Tooltip } from '.';

type ButtonVariant = 'primary' | 'filled' | 'flat';
type ButtonSize = 'sm' | 'md';

export type ButtonProps = {
  label: string;
  hideLabel?: boolean;
  icon?: ReactElement;
  endIcon?: ReactElement;
  size?: ButtonSize;
  variant?: ButtonVariant;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  (
    | {
        role: 'checkbox';
        selected?: boolean;
      }
    | {
        selected?: never;
      }
  );

function Button(
  {
    label,
    className,
    icon,
    endIcon,
    disabled,
    hideLabel,
    size = 'md',
    variant = 'flat',
    selected = false,
    role,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <Tooltip content={label} disabled={!hideLabel}>
      <button
        ref={ref}
        aria-label={hideLabel ? label : undefined}
        role={role}
        aria-checked={selected}
        className={clsx(
          'flex items-center justify-between rounded transition-colors focus:outline-primary font-medium',
          size === 'sm' && [
            'py-1 gap-1',
            icon !== undefined ? 'ps-1' : 'ps-2',
            hideLabel || endIcon ? 'pe-1' : 'pe-2',
            '[&_.material-symbols-rounded]:text-[20px] text-sm',
          ],
          size === 'md' && [
            'py-2 gap-2',
            icon !== undefined ? 'ps-2' : 'ps-3',
            hideLabel || endIcon ? 'pe-2' : 'pe-3',
          ],
          variant === 'flat' && [
            !disabled && [
              !selected && 'hover:bg-surface-high text-on-surface/80',
              selected && 'hover:bg-primary/20 bg-primary/10',
            ],
            disabled && 'text-muted',
          ],
          variant === 'filled' && [
            !disabled &&
              'bg-surface-high hover:bg-surface-higher text-on-surface/80',
            disabled && 'text-muted bg-surface/50',
          ],
          variant === 'primary' && [
            'text-on-primary',
            !disabled && 'bg-primary hover:bg-primary-high',
            disabled && 'bg-muted',
          ],
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {icon}
        {!hideLabel && label}
        {endIcon}
      </button>
    </Tooltip>
  );
}

export default forwardRef(Button);
