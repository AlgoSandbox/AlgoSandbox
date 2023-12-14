import clsx from 'clsx';

import { MaterialSymbol } from '.';

type TabProps = {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  onClose: () => void;
  closeable?: boolean;
  className?: string;
};

export function Tab({
  className,
  label,
  isSelected,
  onClose,
  onClick,
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
      <button className="p-2 font-medium" onClick={onClick}>
        {label}
      </button>
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
  onTabClose: (tab: TabsItem) => void;
  onTabSelect: (tab: TabsItem) => void;
};

export function Tabs({ tabs, onTabClose, onTabSelect }: TabsProps) {
  return (
    <div className="flex relative w-full">
      <div className="absolute bottom-0 w-full border-b -z-10"></div>
      {tabs.map((tab, index) => (
        <Tab
          className={clsx(index > 0 && 'ms-1')}
          key={tab.key}
          isSelected={tab.isSelected}
          label={tab.label}
          closeable={tab.closeable}
          onClick={() => {
            onTabSelect(tab);
          }}
          onClose={() => {
            onTabClose(tab);
          }}
        />
      ))}
    </div>
  );
}
