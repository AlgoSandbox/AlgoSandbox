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
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

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
    <Tooltip content={label} disabled={!hideLabel} zIndex={100}>
      <button
        ref={ref}
        aria-label={hideLabel ? label : undefined}
        role={role}
        aria-checked={selected}
        className={clsx(
          'flex items-center justify-between rounded transition-colors focus:outline-primary font-medium',
          size === 'xs' && [
            'py-1 gap-1',
            icon !== undefined ? 'ps-1' : 'ps-2',
            hideLabel || endIcon ? 'pe-1' : 'pe-2',
            '[&_.material-symbols-rounded]:text-[16px] text-xs',
          ],
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
          size === 'lg' && [
            'py-4 gap-2',
            icon !== undefined ? 'ps-4' : 'ps-5',
            hideLabel || endIcon ? 'pe-4' : 'pe-5',
          ],
          variant === 'flat' && [
            'border',
            !disabled && [
              !selected &&
                'hover:bg-surface-high border-transparent text-on-surface/80 focus-visible:outline-accent',
              selected &&
                'hover:bg-surface-high border-accent focus-visible:outline-accent',
            ],
            disabled && 'text-muted border-transparent',
          ],
          variant === 'filled' && [
            'border bg-surface',
            !disabled && [
              'bg-surface-high hover:bg-surface-higher focus-visible:outline-accent',
              !selected && 'text-on-surface/80',
              selected && 'border-accent text-accent',
            ],
            disabled && 'text-muted',
          ],
          variant === 'primary' && [
            !disabled &&
              'text-accent border hover:border-accent focus-visible:outline-accent bg-surface-high transition-all hover:bg-surface-higher',
            disabled && 'border bg-canvas text-muted',
          ],
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {icon}
        {!hideLabel && <span className="truncate">{label}</span>}
        {endIcon}
      </button>
    </Tooltip>
  );
}

export default forwardRef(Button);
