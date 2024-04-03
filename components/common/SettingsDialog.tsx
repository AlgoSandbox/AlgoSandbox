import { Select } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import { useTheme } from 'next-themes';
import { ComponentProps, useMemo } from 'react';

const themeOptions = [
  { label: 'System', key: 'system', value: 'system' },
  { label: 'Light', key: 'light', value: 'light' },
  { label: 'Dark', key: 'dark', value: 'dark' },
];

export type SettingsDialogProps = Pick<
  ComponentProps<typeof Dialog>,
  'open' | 'onOpenChange'
>;

export default function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const selectedThemeOption = useMemo(() => {
    return themeOptions.find((option) => option.value === theme);
  }, [theme]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Settings"
      content={
        <div className="p-4 flex flex-col gap-4 items-start">
          <Select
            options={themeOptions}
            value={selectedThemeOption?.key}
            onChange={(option) => {
              setTheme(option.value);
            }}
            label="Theme"
          />
        </div>
      }
    />
  );
}
