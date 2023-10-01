import clsx from 'clsx';
import { ButtonHTMLAttributes, DetailedHTMLProps, ReactElement } from 'react';

export type ButtonProps = {
  label: string;
  hideLabel?: boolean;
  className?: string;
  icon?: ReactElement;
} & Pick<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  'onClick' | 'disabled'
>;

export default function Button({
  label,
  className,
  icon,
  disabled,
  hideLabel,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-label={hideLabel ? label : undefined}
      className={clsx(
        'flex items-center gap-2 rounded py-2 transition-colors',
        'pe-2',
        icon !== undefined ? 'ps-1' : 'ps-2',
        !disabled && 'hover:bg-primary-100 ',
        disabled && 'text-neutral-300',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon}
      {!hideLabel && label}
    </button>
  );
}
