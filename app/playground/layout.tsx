'use client';

import { SandboxBox } from '@algo-sandbox/core';
import { BoxContextProvider } from '@components/box-page';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import TabManagerProvider from '@components/tab-manager/TabManager';
import { useAddSavedBoxMutation } from '@utils/db/boxes';
import { evalSavedObject } from '@utils/evalSavedObject';
import { isEqual } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type SandboxBoxNamed = SandboxBox & { name: string };

function LayoutImpl({
  children,
  box,
  onBoxChange,
}: {
  children: React.ReactNode;
  box: SandboxBoxNamed | null;
  onBoxChange: (box: SandboxBoxNamed | null) => void;
}) {
  const router = useRouter();
  const { mutateAsync: saveBox } = useAddSavedBoxMutation();

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
          if (box === null) {
            return;
          }
          const newBox = update(box);
          onBoxChange(newBox);
        }}
        onBoxReset={() => {}}
        onBoxSaveAs={async (name) => {
          if (box === null) {
            return;
          }

          const { key: newBoxKey } = await saveBox({
            name: name,
            type: 'box',
            editable: true,
            files: {
              'index.ts': `const box = ${JSON.stringify(box)};

              export default box;
              `,
            },
          });
          router.replace(`/playground?box=${newBoxKey}`);
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
  const router = useRouter();

  const savedBox = useMemo(() => {
    const flattenedOptions = boxOptions.flatMap((group) => group.options);
    return flattenedOptions.find((box) => box.key === boxKey);
  }, [boxOptions, boxKey]);

  const originalBox = useMemo(() => {
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
    if (originalBox === null) {
      return null;
    }

    const parseFromJson = (json: string | null) => {
      if (json === null) {
        return undefined;
      }

      return JSON.parse(json);
    };

    return {
      ...originalBox,
      name: savedBox?.label ?? 'Untitled box',
      problem: parseFromJson(params.get('problem')) ?? originalBox.problem,
      problemAlgorithm:
        params.get('problemAlgorithm') !== null
          ? parseFromJson(params.get('problemAlgorithm')) ?? undefined
          : originalBox.problemAlgorithm,
      algorithm:
        parseFromJson(params.get('algorithm')) ?? originalBox.algorithm,
      visualizers:
        params.get('visualizers') !== null
          ? parseFromJson(params.get('visualizers')) ?? undefined
          : originalBox.visualizers,
      algorithmVisualizers:
        params.get('algorithmVisualizers') !== null
          ? parseFromJson(params.get('algorithmVisualizers')) ?? undefined
          : originalBox.algorithmVisualizers,
    };
  }, [originalBox, params, savedBox?.label]);

  const onBoxChange = useCallback(
    (box: SandboxBox | null) => {
      if (box === null || originalBox === null) {
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
      if (
        !isEqual(box.algorithmVisualizers, originalBox?.algorithmVisualizers)
      ) {
        searchParams.set(
          'algorithmVisualizers',
          box.algorithmVisualizers
            ? JSON.stringify(box.algorithmVisualizers)
            : 'null',
        );
      }

      router.replace(`/playground?${searchParams.toString()}`);
    },
    [boxKey, originalBox, router],
  );

  return (
    <LayoutImpl onBoxChange={onBoxChange} box={boxFromUrlCustomized}>
      {children}
    </LayoutImpl>
  );
}
