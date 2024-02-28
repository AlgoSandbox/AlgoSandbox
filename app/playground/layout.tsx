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
  boxKey,
  onBoxChange,
  onBoxReset,
}: {
  children: React.ReactNode;
  box: SandboxBoxNamed | null;
  boxKey: string | null;
  onBoxChange: (boxKey: string, box: SandboxBoxNamed | null) => void;
  onBoxReset: () => void;
}) {
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
          if (box === null || boxKey == null) {
            return;
          }
          const newBox = update(box);
          onBoxChange(boxKey, newBox);
        }}
        onBoxReset={onBoxReset}
        onBoxSaveAs={async (name) => {
          if (box === null) {
            return;
          }
          const newBox = {
            name: name,
            type: 'box',
            editable: true,
            files: {
              'index.ts': `const box = ${JSON.stringify(box)};
              export default box;
              `,
            },
          } as const;
          const { key: newBoxKey } = await saveBox(newBox);
          onBoxChange(newBoxKey, box);
        }}
      >
        {children}
      </BoxContextProvider>
    </TabManagerProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { boxOptions } = useSandboxComponents();
  const boxKey = params.get('box');

  const savedBox = useMemo(() => {
    if (boxKey === null) {
      return null;
    }
    const flattenedOptions = boxOptions.flatMap((group) => group.options);
    return flattenedOptions.find((box) => box.key === boxKey) ?? null;
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
    (newBoxKey: string, box: SandboxBox | null) => {
      if (box === null || originalBox === null) {
        return;
      }

      const searchParams = new URLSearchParams();

      searchParams.set('box', newBoxKey);
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
    [originalBox, router],
  );

  const onBoxReset = useCallback(() => {
    if (boxKey === null) {
      return;
    }
    onBoxChange(boxKey, originalBox);
  }, [boxKey, onBoxChange, originalBox]);

  return (
    <LayoutImpl
      boxKey={boxKey}
      onBoxChange={onBoxChange}
      onBoxReset={onBoxReset}
      box={boxFromUrlCustomized}
    >
      {children}
    </LayoutImpl>
  );
}
