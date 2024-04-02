import * as RadixTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
  open?: boolean;
  zIndex?: number;
};

export default function Tooltip({
  content,
  children,
  disabled,
  open,
  side = 'top',
  zIndex = 30,
}: TooltipProps) {
  return disabled ? (
    children
  ) : (
    <RadixTooltip.Root delayDuration={300} open={open}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          hideWhenDetached
          className={clsx(
            'bg-surface rounded px-4 py-2 text-on-surface border max-w-md',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          )}
          style={{
            zIndex,
          }}
        >
          {content}
          <RadixTooltip.Arrow className="fill-border" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
