'use client';

import BoxManagerProvider, {
  SandboxBoxNamed,
  useBox,
  useBoxManager,
} from '@app/BoxManager';
import { BoxContextProvider } from '@components/box-page';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
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
  const box = useBox('box').mapLeft(() => null).value;
  const originalBox = useBox(boxKey).mapLeft(() => null).value;

  useEffect(() => {
    if (box === null) {
      return;
    }
    const searchParams = new URLSearchParams();

    searchParams.set('box', boxKey);

    if (box.problem !== originalBox?.problem) {
      searchParams.set('problem', JSON.stringify(box.problem));
    }
    if (!isEqual(box.problemAlgorithm, originalBox?.problemAlgorithm)) {
      searchParams.set(
        'problemAlgorithm',
        box.problemAlgorithm ? JSON.stringify(box.problemAlgorithm) : 'null',
      );
    }
    if (box.algorithm !== originalBox?.algorithm) {
      searchParams.set('algorithm', JSON.stringify(box.algorithm));
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
  const { boxOptions } = useSandboxComponents();
  const params = useSearchParams();
  const boxKey = params.get('box') ?? '';

  const savedBox = useMemo(() => {
    const flattenedOptions = boxOptions.flatMap((group) => group.options);
    return flattenedOptions.find((box) => box.key === boxKey);
  }, [boxOptions, boxKey]);

  const boxFromUrl = useMemo(() => {
    if (!savedBox) {
      return null;
    }

    const evaledBox = evalSavedObject<'box'>(savedBox.value).mapLeft(
      () => null,
    ).value;
    if (evaledBox === null) {
      // TODO: display error
      return null;
    }
    return evaledBox;
  }, [savedBox]);

  const boxFromUrlCustomized = useMemo(() => {
    if (boxFromUrl === null) {
      return null;
    }

    const parseFromJson = (json: string | null) => {
      if (json === null) {
        return undefined;
      }

      return JSON.parse(json);
    };

    return {
      ...boxFromUrl,
      problem: parseFromJson(params.get('problem')) ?? boxFromUrl.problem,
      problemAlgorithm:
        params.get('problemAlgorithm') !== null
          ? parseFromJson(params.get('problemAlgorithm')) ?? undefined
          : boxFromUrl.problemAlgorithm,
      algorithm: parseFromJson(params.get('algorithm')) ?? boxFromUrl.algorithm,
      visualizers:
        params.get('visualizers') !== null
          ? parseFromJson(params.get('visualizers')) ?? undefined
          : boxFromUrl.visualizers,
      algorithmVisualizers:
        params.get('algorithmVisualizers') !== null
          ? parseFromJson(params.get('algorithmVisualizers')) ?? undefined
          : boxFromUrl.algorithmVisualizers,
    };
  }, [boxFromUrl, params]);

  const defaultBoxes: Record<string, SandboxBoxNamed> = useMemo(() => {
    if (boxFromUrl) {
      return { box: { ...boxFromUrlCustomized, name: '' } } as Record<
        string,
        SandboxBoxNamed
      >;
    }
    return {};
  }, [boxFromUrl, boxFromUrlCustomized]);

  return (
    <BoxManagerProvider defaultBoxes={defaultBoxes}>
      <LayoutImpl boxKey={boxKey}>{children}</LayoutImpl>
    </BoxManagerProvider>
  );
}
