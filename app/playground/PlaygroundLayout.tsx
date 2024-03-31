'use client';

import { ComponentTag, SandboxBox } from '@algo-sandbox/core';
import { BoxContextProvider } from '@components/box-page';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import TabManagerProvider from '@components/tab-manager/TabManager';
import {
  useAddSavedBoxMutation,
  useRemoveSavedBoxMutation,
  useSetSavedBoxMutation,
} from '@utils/db/boxes';
import evalSavedObject from '@utils/eval/evalSavedObject';
import stringifyComponentConfigToTs from '@utils/stringifyComponentConfigToTs';
import { isEqual, mergeWith } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

  const handleSaveAsNew = useCallback(
    async ({ name, tags }: { name: string; tags: Array<ComponentTag> }) => {
      if (box === null) {
        return;
      }
      const newBox = {
        name,
        type: 'box',
        editable: true,
        files: {
          'index.ts': `const box = ${JSON.stringify(box)};
        export default box;
        `,
          'config.ts': stringifyComponentConfigToTs({ tags }),
        },
      } as const;
      const { key: newBoxKey } = await saveBox(newBox);
      onBoxChange(({ box }) => {
        return {
          boxKey: newBoxKey,
          box,
        };
      });
    },
    [box, onBoxChange, saveBox],
  );

  const handleSave = useCallback(
    async ({ name, tags }: { name: string; tags: Array<ComponentTag> }) => {
      if (box === null || boxKey === null) {
        return;
      }
      const newBox = {
        key: boxKey,
        name,
        type: 'box',
        editable: true,
        files: {
          'index.ts': `const box = ${JSON.stringify(box)};
          export default box;
          `,
          'config.ts': stringifyComponentConfigToTs({ tags }),
        },
      } as const;

      await setSavedBox(newBox);
    },
    [box, boxKey, setSavedBox],
  );

  const handleBoxSave = useCallback(
    async ({
      name,
      tags,
      asNew,
    }: {
      name: string;
      tags: Array<ComponentTag>;
      asNew: boolean;
    }) => {
      if (asNew) {
        return handleSaveAsNew({ name, tags });
      } else {
        return handleSave({ name, tags });
      }
    },
    [handleSave, handleSaveAsNew],
  );

  const onBoxUpdate = useCallback(
    (update: (box: SandboxBoxNamed) => SandboxBoxNamed) => {
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
    },
    [onBoxChange],
  );

  const onBoxDelete = useCallback(async () => {
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
  }, [boxKey, deleteSavedBox]);

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
        onBoxUpdate={onBoxUpdate}
        onBoxReset={onBoxReset}
        onBoxSave={handleBoxSave}
        onBoxDelete={onBoxDelete}
      >
        {children}
      </BoxContextProvider>
    </TabManagerProvider>
  );
}

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { boxOptions } = useSandboxComponents();
  const boxKey = params.get('box');

  const savedBox = useMemo(() => {
    if (boxKey === null) {
      return null;
    }
    return boxOptions.find((box) => box.key === boxKey) ?? null;
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
      componentNames:
        params.get('componentNames') !== null
          ? parseFromJson(params.get('componentNames')) ?? undefined
          : originalBox.componentNames,
    };
  }, [originalBox, params, savedBox?.label]);

  console.info('boxObject', JSON.stringify(boxFromUrlCustomized));

  const [boxState, setBoxState] = useState<BoxState>({
    boxKey,
    box: boxFromUrlCustomized,
  });

  // Load box from url
  useEffect(() => {
    const newBox = (() => {
      const oldBox = boxState.box;
      if (oldBox === null) {
        return boxFromUrlCustomized;
      }

      // Use lodash mergeWith to merge the two boxes
      // If a key's value is equal to the new one in value, then don't replace it with the new one
      // e.g. problem: oldBox.problem or boxFromUrlCustomized.problem.
      // If isEqual(oldBox.problem, boxFromUrlCustomized.problem) is true, then problem: oldBox.problem
      // else problem: boxFromUrlCustomized.problem
      return mergeWith(oldBox, boxFromUrlCustomized, (objValue, srcValue) => {
        if (isEqual(objValue, srcValue)) {
          return objValue;
        }

        return srcValue;
      });
    })();

    setBoxState(() => ({
      boxKey,
      box: newBox,
    }));
  }, [boxFromUrlCustomized, boxKey, boxState.box]);

  const updateBoxUrl = useCallback(
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
      if (!isEqual(box.componentNames, originalBox.componentNames)) {
        searchParams.set(
          'componentNames',
          box.componentNames ? JSON.stringify(box.componentNames) : 'null',
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
    updateBoxUrl(boxKey, originalBox);
  }, [boxKey, originalBox, updateBoxUrl]);

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
    if (params.get('componentNames') !== null) {
      return true;
    }

    return false;
  }, [params]);

  const onUiBoxChange = useCallback(
    (update: (oldBox: BoxState) => BoxState) => {
      setBoxState(update);
      const { box: newBox, boxKey: newBoxKey } = update(boxState);

      updateBoxUrl(newBoxKey, newBox);
    },
    [boxState, updateBoxUrl],
  );

  return (
    <LayoutImpl
      onBoxChange={onUiBoxChange}
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
