'use client';

import BoxManagerProvider, { SandboxBoxNamed } from '@app/BoxManager';
import { BoxContextProvider } from '@components/box-page';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import TabManagerProvider from '@components/tab-manager/TabManager';
import { evalSavedObject } from '@utils/evalSavedObject';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

function LayoutImpl({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const boxKey = params.get('key') ?? '';
  const { builtInBoxOptions } = useBuiltInComponents();

  // find the box with the given key
  const savedBox = useMemo(() => {
    const flattenedOptions = builtInBoxOptions.flatMap(
      (group) => group.options,
    );
    return flattenedOptions.find((box) => box.key === boxKey);
  }, [builtInBoxOptions, boxKey]);

  const box = useMemo(() => {
    if (!savedBox) {
      return null;
    }

    const { objectEvaled: evaledBox } = evalSavedObject<'box'>(savedBox.value);
    if (evaledBox === null) {
      // TODO: display error
      return null;
    }
    return evaledBox;
  }, [savedBox]);

  const defaultBoxes: Record<string, SandboxBoxNamed> = useMemo(() => {
    if (box) {
      return { box: { ...box, name: '' } } as Record<string, SandboxBoxNamed>;
    }
    return {};
  }, [box]);

  return (
    <BoxManagerProvider defaultBoxes={defaultBoxes}>
      <TabManagerProvider
        defaultSelectedTabId="box"
        defaultTabs={[
          {
            id: 'box',
            type: 'box',
            label: 'Box',
            closeable: false,
          },
          {
            id: 'visualizer',
            type: 'flowchart',
            label: 'Visualizers',
            closeable: false,
          },
        ]}
      >
        <BoxContextProvider boxKey="box">{children}</BoxContextProvider>
      </TabManagerProvider>
    </BoxManagerProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BoxManagerProvider>
      <LayoutImpl>{children}</LayoutImpl>
    </BoxManagerProvider>
  );
}
