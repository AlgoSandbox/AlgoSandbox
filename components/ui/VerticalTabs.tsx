import { useBreakpoint } from '@utils/useBreakpoint';
import clsx from 'clsx';
import { useDrag, useDrop } from 'react-dnd';

import { Button, MaterialSymbol, Tooltip } from '.';

type TabProps = {
  label: string;
  showLabel: boolean;
  icon: string;
  draggable?: boolean;
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
  showLabel,
  isSelected,
  onClose,
  onClick,
  onTabDrop,
  closeable = true,
  draggable = false,
}: TabProps) {
  const [, drag] = useDrag(
    () => ({
      canDrag: draggable,
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

  const { isLg } = useBreakpoint('lg');
  const isMobile = !isLg;

  return (
    <div
      ref={ref}
      className={clsx(
        'flex items-center transition-colors',
        isSelected && 'bg-surface-high text-on-surface',
        !isSelected && 'bg-surface text-on-surface/50 hover:bg-surface',
        isOver && 'bg-surface-higher',
        className,
      )}
    >
      <Tooltip content={label}>
        <button
          className={clsx(
            'font-medium items-center p-4 flex flex-1 gap-2 justify-between overflow-x-hidden group',
          )}
          onClick={() => {
            if (isSelected && closeable && !isMobile) {
              onClose();
              return;
            }
            onClick();
          }}
        >
          <div className="flex gap-2 items-center">
            {icon && (
              <div className="relative w-6 h-6">
                <MaterialSymbol
                  icon={icon}
                  className={clsx(
                    !isSelected && 'text-on-surface/50',
                    isSelected && 'text-accent',
                    isSelected &&
                      closeable &&
                      !isMobile &&
                      'group-focus-active:!hidden group-hover:!hidden block',
                  )}
                />
                {isSelected && closeable && !isMobile && (
                  <MaterialSymbol
                    icon="close"
                    className="text-on-surface/50 !hidden group-focus-active:!block group-hover:!block"
                  />
                )}
                {subIcon && (
                  <MaterialSymbol
                    icon={subIcon}
                    className={clsx(
                      'bg-surface rounded-full !text-[16px] absolute end-0 bottom-0 transform translate-x-1/4 translate-y-1/4',
                      !isSelected && 'text-on-surface/50',
                      isSelected && 'text-accent',
                      isSelected &&
                        closeable &&
                        !isMobile &&
                        'group-focus-active:!hidden group-hover:!hidden block',
                    )}
                  />
                )}
              </div>
            )}
            {showLabel && label}
          </div>
          {isSelected && closeable && isMobile && (
            <Button
              label="Close tab"
              hideLabel
              onClick={onClose}
              icon={<MaterialSymbol icon="close" />}
            />
          )}
        </button>
      </Tooltip>
    </div>
  );
}

export type TabsItem = Readonly<{
  key: string;
  icon: string;
  subIcon?: string;
  label: string;
  isSelected: boolean;
  closeable?: boolean;
}>;

type TabsProps = {
  tabs: Array<TabsItem>;
  draggable: boolean;
  onTabClose: (tab: TabsItem) => void;
  onTabSelect: (tab: TabsItem) => void;
  onTabsReorder: (srcTabId: string, destTabId: string) => void;
  showLabels: boolean;
};

export function VerticalTabs({
  tabs,
  showLabels,
  draggable,
  onTabClose,
  onTabSelect,
  onTabsReorder,
}: TabsProps) {
  return (
    <div className="flex relative flex-col">
      <div className="flex flex-col">
        {tabs.map((tab) => (
          <Tab
            className="flex-shrink-0"
            key={tab.key}
            isSelected={tab.isSelected}
            label={tab.label}
            draggable={draggable}
            showLabel={showLabels}
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
    </div>
  );
}
