import * as RadixTooltip from '@radix-ui/react-tooltip';

export type TooltipProps = {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export default function Tooltip({ content, children, disabled }: TooltipProps) {
  return disabled ? (
    children
  ) : (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={500}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="bg-neutral-700 rounded px-4 py-2 text-white">
            {content}
            <RadixTooltip.Arrow className="fill-neutral-700" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
