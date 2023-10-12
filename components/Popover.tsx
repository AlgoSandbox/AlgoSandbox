import * as RadixPopover from '@radix-ui/react-popover';
import { Button, MaterialSymbol } from '.';

export type PopoverProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

export default function Popover({ children, content }: PopoverProps) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content className="shadow rounded">
          {content}
          <RadixPopover.Close asChild>
            <Button
              className="absolute top-2 end-2"
              label="Close"
              hideLabel
              icon={<MaterialSymbol icon="close" />}
            />
          </RadixPopover.Close>
          <RadixPopover.Arrow className="fill-white" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
