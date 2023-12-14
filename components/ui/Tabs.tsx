import clsx from 'clsx';

import { MaterialSymbol } from '.';

type TabProps = {
  label: string;
  isSelected: boolean;
  onClose: () => void;
  closeable?: boolean;
  className?: string;
};

export function Tab({
  className,
  label,
  isSelected,
  onClose,
  closeable = true,
}: TabProps) {
  return (
    <div
      className={clsx(
        'border flex items-center px-2 transition-colors rounded-t',
        isSelected && 'border-b-transparent bg-surface text-on-surface',
        !isSelected && 'bg-surface/30 text-on-surface/50 hover:bg-surface',
        className,
      )}
    >
      <button className="p-2 font-medium">{label}</button>
      {closeable && (
        <button
          onClick={onClose}
          aria-label="Close tab"
          className="flex items-center"
        >
          <MaterialSymbol icon="close" className="text-on-surface/50" />
        </button>
      )}
    </div>
  );
}

export type TabsItem = Readonly<{
  key: string;
  label: string;
  isSelected: boolean;
  closeable?: boolean;
}>;

type TabsProps = {
  tabs: Array<TabsItem>;
  onTabsChange: (tabs: Array<TabsItem>) => void;
};

export function Tabs({ tabs, onTabsChange }: TabsProps) {
  return (
    <div className="flex relative w-full">
      <div className="absolute bottom-0 w-full border-b -z-10"></div>
      {tabs.map(({ key, label, isSelected, closeable }, index) => (
        <Tab
          className={clsx(index > 0 && 'ms-1')}
          key={key}
          isSelected={isSelected}
          label={label}
          closeable={closeable}
          onClose={() => {
            onTabsChange(tabs.filter((tab) => tab.key !== key));
          }}
        />
      ))}
    </div>
  );
}
