'use client';

import { SandboxBox } from '@algo-sandbox/core';
import { BoxContextProvider } from '@components/box-page';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import TabManagerProvider from '@components/tab-manager/TabManager';
import {
  useAddSavedBoxMutation,
  useRemoveSavedBoxMutation,
  useSetSavedBoxMutation,
} from '@utils/db/boxes';
import { evalSavedObject } from '@utils/evalSavedObject';
import { isEqual } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

export type SandboxBoxNamed = SandboxBox & { name: string };

type BoxState = {
  boxKey: string | null;
  box: SandboxBoxNamed | null;
};

function LayoutImpl({
  children,
  box,
  boxKey,
  onBoxChange,
  onBoxReset,
  isBoxCustom,
  isBoxDirty,
}: {
  children: React.ReactNode;
  box: SandboxBoxNamed | null;
  boxKey: string | null;
  onBoxChange: (update: (oldBox: BoxState) => BoxState) => void;
  onBoxReset: () => void;
  isBoxCustom: boolean;
  isBoxDirty: boolean;
}) {
  const { mutateAsync: saveBox } = useAddSavedBoxMutation();
  const { mutateAsync: setSavedBox } = useSetSavedBoxMutation();
  const { mutateAsync: deleteSavedBox } = useRemoveSavedBoxMutation();

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
        isBoxCustom={isBoxCustom}
        isBoxDirty={isBoxDirty}
        onBoxUpdate={(update) => {
          onBoxChange(({ boxKey, box }) => {
            if (box === null) {
              return { boxKey, box };
            }
            const newBox = update(box);
            return {
              boxKey,
              box: newBox,
            };
          });
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
          onBoxChange(({ box }) => {
            return {
              boxKey: newBoxKey,
              box,
            };
          });
        }}
        onBoxSave={async () => {
          if (box === null || boxKey === null) {
            return;
          }
          const newBox = {
            key: boxKey,
            name: box.name,
            type: 'box',
            editable: true,
            files: {
              'index.ts': `const box = ${JSON.stringify(box)};
              export default box;
              `,
            },
          } as const;

          await setSavedBox(newBox);
        }}
        onBoxDelete={async () => {
          if (boxKey === null) {
            return;
          }

          await deleteSavedBox({
            key: boxKey,
            type: 'box',
            files: {},
            name: '',
            editable: false,
          });
        }}
      >
        {children}
      </BoxContextProvider>
    </TabManagerProvider>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
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

  const isBoxCustom = useMemo(() => {
    return savedBox?.type === 'custom';
  }, [savedBox]);

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
      algorithm:
        parseFromJson(params.get('algorithm')) ?? originalBox.algorithm,
      visualizers:
        params.get('visualizers') !== null
          ? parseFromJson(params.get('visualizers')) ?? undefined
          : originalBox.visualizers,
      config:
        params.get('config') !== null
          ? parseFromJson(params.get('config')) ?? undefined
          : originalBox.config,
    };
  }, [originalBox, params, savedBox?.label]);

  console.info('boxObject', boxFromUrlCustomized);

  const [boxState, setBoxState] = useState<BoxState>({
    boxKey,
    box: boxFromUrlCustomized,
  });

  useEffect(() => {
    setBoxState(() => ({
      boxKey,
      box: boxFromUrlCustomized,
    }));
  }, [boxFromUrlCustomized, boxKey]);

  const onBoxChange = useCallback(
    (boxKey: string | null, box: SandboxBox | null) => {
      if (box === null || originalBox === null || boxKey === null) {
        router.replace('/playground');
        return;
      }

      const searchParams = new URLSearchParams();

      searchParams.set('box', boxKey);
      if (box.problem !== originalBox?.problem) {
        searchParams.set('problem', JSON.stringify(box.problem));
      }
      if (box.algorithm !== originalBox.algorithm) {
        searchParams.set('algorithm', JSON.stringify(box.algorithm));
      }
      if (!isEqual(box.visualizers, originalBox.visualizers)) {
        searchParams.set('visualizers', JSON.stringify(box.visualizers));
      }
      if (!isEqual(box.config, originalBox.config)) {
        searchParams.set(
          'config',
          box.config ? JSON.stringify(box.config) : 'null',
        );
      }

      router.replace(`/playground?${searchParams.toString()}`);
    },
    [originalBox, router],
  );

  useEffect(() => {
    onBoxChange(boxState.boxKey, boxState.box);
  }, [boxState, onBoxChange]);

  const onBoxReset = useCallback(() => {
    if (boxKey === null) {
      return;
    }
    onBoxChange(boxKey, originalBox);
  }, [boxKey, onBoxChange, originalBox]);

  const isBoxDirty = useMemo(() => {
    if (params.get('problem') !== null) {
      return true;
    }
    if (params.get('algorithm') !== null) {
      return true;
    }
    if (params.get('visualizers') !== null) {
      return true;
    }
    if (params.get('config') !== null) {
      return true;
    }

    return false;
  }, [params]);

  return (
    <LayoutImpl
      onBoxChange={setBoxState}
      onBoxReset={onBoxReset}
      box={boxState.box}
      boxKey={boxState.boxKey}
      isBoxCustom={isBoxCustom}
      isBoxDirty={isBoxDirty}
    >
      {children}
    </LayoutImpl>
  );
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <Layout>{children}</Layout>
    </Suspense>
  );
}
