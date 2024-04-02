import clsx from 'clsx';

export default function Chip({
  children,
  disabled,
  selected,
  selectable,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
}) {
  const className = clsx(
    'border rounded flex items-center px-2 font-semibold tracking-tight',
    disabled
      ? 'text-muted'
      : [selected ? 'text-accent bg-surface border-accent' : 'text-label'],
  );

  if (selectable) {
    return (
      <button
        className={className}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  }
  return (
    <span className={className} onClick={onClick}>
      {children}
    </span>
  );
}
