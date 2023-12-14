import { PanelResizeHandle } from 'react-resizable-panels';

export default function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-1.5 group flex justify-center">
      <div className="w-px h-full bg-border group-hover:bg-primary group-hover:w-1 transition"></div>
    </PanelResizeHandle>
  );
}
