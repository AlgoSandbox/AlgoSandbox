import clsx from 'clsx';

export type MaterialSymbolProps = {
  icon: string;
  className?: string;
};

export default function MaterialSymbol({
  icon,
  className,
}: MaterialSymbolProps) {
  return (
    <span className={clsx('material-symbols-outlined', className)}>{icon}</span>
  );
}
