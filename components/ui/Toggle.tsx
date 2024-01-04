import * as Switch from '@radix-ui/react-switch';
import clsx from 'clsx';

type ToggleProps = {
  className?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export default function Toggle({
  className,
  label,
  value,
  onChange,
}: ToggleProps) {
  return (
    <div className={clsx('flex items-center gap-2 flex-shrink-0', className)}>
      <label className="text-sm font-medium">{label}</label>
      <Switch.Root
        className="group w-10 h-6 border hover:border-on-surface/30 rounded px-1 bg-surface data-[state=checked]:bg-primary/30 data-[state=checked]:hover:border-primary-high data-[state=checked]:border-primary transition-colors"
        checked={value}
        onCheckedChange={onChange}
      >
        <Switch.Thumb className="rounded bg-on-surface/30 group-hover:bg-on-surface/50 block w-4 h-4 data-[state=checked]:bg-primary data-[state=checked]:translate-x-full data-[state=checked]:group-hover:bg-primary-high transition" />
      </Switch.Root>
    </div>
  );
}
