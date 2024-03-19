import clsx from 'clsx';
import { PanelResizeHandle } from 'react-resizable-panels';

export default function ResizeHandle({
  orientation = 'vertical',
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <PanelResizeHandle
      className={clsx(
        'group justify-center',
        orientation === 'vertical' && 'w-1.5',
        orientation === 'horizontal' && 'h-1.5 flex-col',
      )}
    >
      <div
        className={clsx(
          'bg-border group-hover:bg-primary transition',
          orientation === 'vertical' && 'w-px h-full group-hover:w-1',
          orientation === 'horizontal' && 'h-px w-full group-hover:h-1',
        )}
      />
    </PanelResizeHandle>
  );
}
