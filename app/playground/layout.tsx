'use client';

import BoxManagerProvider, {
  SandboxBoxNamed,
  useBox,
  useBoxManager,
} from '@app/BoxManager';
import { BoxContextProvider } from '@components/box-page';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import TabManagerProvider from '@components/tab-manager/TabManager';
import { evalSavedObject } from '@utils/evalSavedObject';
import { isEqual } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

function LayoutImpl({
  children,
  boxKey,
}: {
  children: React.ReactNode;
  boxKey: string;
}) {
  const { updateBox, getBox } = useBoxManager();
  const router = useRouter();
  const box = useBox('box');
  const originalBox = useBox(boxKey);

  useEffect(() => {
    if (box === null) {
      return;
    }
    // replace url with ?problem=<problemKey>&visualizer=<visualizerKey>...
    const searchParams = new URLSearchParams();

    searchParams.set('box', boxKey);

    if (box.problem !== originalBox?.problem) {
      searchParams.set('problem', box.problem);
    }
    if (!isEqual(box.problemAlgorithm, originalBox?.problemAlgorithm)) {
      searchParams.set(
        'problemAlgorithm',
        box.problemAlgorithm ? JSON.stringify(box.problemAlgorithm) : 'null',
      );
    }
    if (box.algorithm !== originalBox?.algorithm) {
      searchParams.set('algorithm', box.algorithm);
    }
    if (!isEqual(box.visualizers, originalBox?.visualizers)) {
      searchParams.set('visualizers', JSON.stringify(box.visualizers));
    }
    if (!isEqual(box.algorithmVisualizers, originalBox?.algorithmVisualizers)) {
      searchParams.set(
        'algorithmVisualizers',
        box.algorithmVisualizers
          ? JSON.stringify(box.algorithmVisualizers)
          : 'null',
      );
    }
    router.replace(`/playground?${searchParams.toString()}`);
  }, [
    box,
    boxKey,
    getBox,
    originalBox?.algorithm,
    originalBox?.algorithmVisualizers,
    originalBox?.problem,
    originalBox?.problemAlgorithm,
    originalBox?.visualizers,
    router,
  ]);

  return (
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
      <BoxContextProvider
        box={box}
        onBoxUpdate={(update) => {
          updateBox('box', update);
        }}
        onBoxReset={() => {
          router.replace(`/playground?box=${boxKey}`);
        }}
      >
        {children}
      </BoxContextProvider>
    </TabManagerProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { builtInBoxOptions } = useBuiltInComponents();
  const params = useSearchParams();
  const boxKey = params.get('box') ?? '';

  // TODO: Allow using custom boxes
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

  const boxFromUrl = useMemo(() => {
    if (box === null) {
      return null;
    }

    return {
      ...box,
      problem: params.get('problem') ?? box.problem,
      problemAlgorithm:
        params.get('problemAlgorithm') !== null
          ? JSON.parse(params.get('problemAlgorithm')!) ?? undefined
          : box.problemAlgorithm,
      algorithm: params.get('algorithm') ?? box.algorithm,
      visualizers:
        params.get('visualizers') !== null
          ? JSON.parse(params.get('visualizers')!) ?? undefined
          : box.visualizers,
      algorithmVisualizers:
        params.get('algorithmVisualizers') !== null
          ? JSON.parse(params.get('algorithmVisualizers')!) ?? undefined
          : box.algorithmVisualizers,
    };
  }, [box, params]);

  const defaultBoxes: Record<string, SandboxBoxNamed> = useMemo(() => {
    if (boxFromUrl) {
      return { box: { ...boxFromUrl, name: '' } } as Record<
        string,
        SandboxBoxNamed
      >;
    }
    return {};
  }, [boxFromUrl]);

  return (
    <BoxManagerProvider defaultBoxes={defaultBoxes}>
      <LayoutImpl boxKey={boxKey}>{children}</LayoutImpl>
    </BoxManagerProvider>
  );
}
