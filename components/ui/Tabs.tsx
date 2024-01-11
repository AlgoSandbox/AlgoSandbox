import clsx from 'clsx';
import { useDrag, useDrop } from 'react-dnd';

import { Button, MaterialSymbol } from '.';

type TabProps = {
  label: string;
  icon?: string;
  subIcon?: string;
  isSelected: boolean;
  onClick: () => void;
  onClose: () => void;
  onTabDrop: (tabId: string) => void;
  closeable?: boolean;
  id: string;
  className?: string;
};

export function Tab({
  className,
  id,
  icon,
  subIcon,
  label,
  isSelected,
  onClose,
  onClick,
  onTabDrop,
  closeable = true,
}: TabProps) {
  const [, drag] = useDrag(
    () => ({
      type: 'tab',
      item: { id },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [],
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'tab',
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      drop: (item: { id: string }) => {
        onTabDrop(item.id);
      },
    }),
    [],
  );

  const ref = (node: HTMLDivElement | null) => {
    drag(drop(node));
  };

  return (
    <div
      ref={ref}
      className={clsx(
        'border flex items-center px-2 transition-colors rounded-t',
        isSelected && 'border-b-transparent bg-surface text-on-surface',
        !isSelected && 'bg-surface/30 text-on-surface/50 hover:bg-surface',
        isOver && 'bg-surface-higher',
        className,
      )}
    >
      <button
        className={clsx(
          'font-medium items-center flex gap-2',
          icon && 'ps-1 pe-2',
          !icon && 'px-2',
        )}
        onClick={onClick}
      >
        {icon && (
          <div className="relative w-6 h-6">
            <MaterialSymbol
              icon={icon}
              className={clsx(
                'text-on-surface/50',
                isSelected && 'text-on-surface',
              )}
            />
            {subIcon && (
              <MaterialSymbol
                icon={subIcon}
                className={clsx(
                  'bg-surface rounded-full text-on-surface/50 !text-[16px] absolute end-0 bottom-0 transform translate-x-1/4 translate-y-1/4',
                  isSelected && 'text-on-surface',
                )}
              />
            )}
          </div>
        )}
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
  icon?: string;
  subIcon?: string;
  label: string;
  isSelected: boolean;
  closeable?: boolean;
}>;

type TabsProps = {
  tabs: Array<TabsItem>;
  onNewTabOpen: () => void;
  onTabClose: (tab: TabsItem) => void;
  onTabSelect: (tab: TabsItem) => void;
  onTabsReorder: (srcTabId: string, destTabId: string) => void;
};

export function Tabs({
  tabs,
  onNewTabOpen,
  onTabClose,
  onTabSelect,
  onTabsReorder,
}: TabsProps) {
  return (
    <div className="flex relative w-full overflow-x-hidden">
      <div className="absolute bottom-0 w-full border-b -z-10"></div>
      <div className="flex overflow-x-auto">
        {tabs.map((tab, index) => (
          <Tab
            className={clsx('flex-shrink-0', index > 0 && 'ms-1')}
            key={tab.key}
            isSelected={tab.isSelected}
            label={tab.label}
            id={tab.key}
            icon={tab.icon}
            subIcon={tab.subIcon}
            closeable={tab.closeable}
            onClick={() => {
              onTabSelect(tab);
            }}
            onTabDrop={(tabId) => {
              onTabsReorder(tabId, tab.key);
            }}
            onClose={() => {
              onTabClose(tab);
            }}
          />
        ))}
      </div>
      <Button
        className="border-s border-r border-t rounded-es-none rounded-ee-none ms-1"
        onClick={onNewTabOpen}
        label="New tab"
        hideLabel={true}
        icon={<MaterialSymbol icon="add" />}
      />
    </div>
  );
}
