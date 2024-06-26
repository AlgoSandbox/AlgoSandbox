'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-high group-[.toaster]:text-on-surface group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-surface group-[.toast]:!border group-[.toast]:!border-border group-[.toast]:hover:!border-accent group-[.toast]:!border-solid group-[.toast]:text-accent group-[.toast]:transition-colors',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted',
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
