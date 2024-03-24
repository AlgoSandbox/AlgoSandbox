import clsx from 'clsx';

export default function Chip({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <span
      className={clsx(
        'border rounded flex items-center px-2 font-semibold tracking-tight',
        disabled ? 'text-muted' : 'text-label',
      )}
    >
      {children}
    </span>
  );
}
