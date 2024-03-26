import * as RadixPopover from '@radix-ui/react-popover';
import { useBreakpoint } from '@utils/useBreakpoint';
import clsx from 'clsx';
import { useState } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerNestedRoot,
  DrawerTrigger,
} from './Drawer';

export type PopoverProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  align?: 'center' | 'start' | 'end';
  triggerMode?: 'click' | 'hover';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function Popover({
  children,
  content,
  align = 'start',
  triggerMode = 'click',
  open: externalOpen,
  onOpenChange,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [closeTimeoutId, setCloseTimeoutId] = useState<NodeJS.Timeout | null>(
    null,
  );

  const open = externalOpen ?? internalOpen;
  const setOpen = (open: boolean) => {
    (onOpenChange ?? setInternalOpen)(open);
  };

  const handleButtonMouseEnter = () => {
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
      setCloseTimeoutId(null);
    }
    setOpen(true);
  };

  const handleButtonMouseLeave = () => {
    if (closeTimeoutId) {
      return;
    }
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 200);
    setCloseTimeoutId(timeout);
  };

  const handleContentMouseEnter = () => {
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
      setCloseTimeoutId(null);
    }
  };

  const handleContentMouseLeave = () => {
    setOpen(false);
  };

  const { isMd } = useBreakpoint('md');

  if (isMd) {
    return (
      <RadixPopover.Root open={open} onOpenChange={setOpen}>
        <RadixPopover.Trigger
          onMouseEnter={
            triggerMode === 'hover' ? handleButtonMouseEnter : undefined
          }
          onMouseLeave={
            triggerMode === 'hover' ? handleButtonMouseLeave : undefined
          }
          asChild
        >
          {children}
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <RadixPopover.Content
            onMouseEnter={
              triggerMode === 'hover' ? handleContentMouseEnter : undefined
            }
            onMouseMove={
              triggerMode === 'hover' && closeTimeoutId
                ? handleContentMouseEnter
                : undefined
            }
            onMouseLeave={
              triggerMode === 'hover' ? handleContentMouseLeave : undefined
            }
            align={align}
            className={clsx(
              'border overflow-clip rounded-md pointer-events-auto',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            )}
          >
            {content}
            <RadixPopover.Arrow className="fill-surface-higher" />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerNestedRoot>{content}</DrawerNestedRoot>
      </DrawerContent>
    </Drawer>
  );
}
