import * as Switch from '@radix-ui/react-switch';

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export default function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Switch.Root
        className="w-10 h-6 border border-neutral-300 rounded px-1 bg-primary-50 data-[state=checked]:bg-primary-200 data-[state=checked]:border-primary-500 transition-colors"
        checked={value}
        onCheckedChange={onChange}
      >
        <Switch.Thumb className="rounded bg-neutral-500 block w-4 h-4 data-[state=checked]:bg-primary-500 data-[state=checked]:translate-x-full transition" />
      </Switch.Root>
    </div>
  );
}
