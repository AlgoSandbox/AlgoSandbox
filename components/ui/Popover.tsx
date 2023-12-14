import * as RadixPopover from '@radix-ui/react-popover';
import { useState } from 'react';

import { Button, MaterialSymbol } from '.';

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
          className="border overflow-clip rounded-md pointer-events-auto"
        >
          {content}
          <RadixPopover.Close asChild>
            <Button
              className="absolute top-2 end-2"
              label="Close"
              hideLabel
              icon={<MaterialSymbol icon="close" />}
            />
          </RadixPopover.Close>
          <RadixPopover.Arrow className="fill-surface-higher" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
