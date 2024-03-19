'use client';

import SandboxObjectEditorPage from '@app/SandboxObjectEditorPage';
import AppNavBar from '@components/AppNavBar';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useSandboxComponents } from '@components/playground/SandboxComponentsProvider';
import { CatalogOption } from '@constants/catalog';
import { DbSandboxObjectSaved } from '@utils/db';
import { useSaveObjectMutation } from '@utils/db/objects';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function ComponentPage({
  componentKey,
}: {
  componentKey: string;
}) {
  const router = useRouter();
  const {
    adapterOptions,
    algorithmOptions,
    problemOptions,
    visualizerOptions,
  } = useSandboxComponents();

  const { mutateAsync: saveObject } = useSaveObjectMutation();

  const options = useMemo(
    () =>
      [
        ...adapterOptions,
        ...algorithmOptions,
        ...problemOptions,
        ...visualizerOptions,
      ] as Array<CatalogOption<DbSandboxObjectSaved>>,
    [adapterOptions, algorithmOptions, problemOptions, visualizerOptions],
  );

  const selectedOption = useMemo(() => {
    return options.find((option) => option.key === componentKey);
  }, [componentKey, options]);

  const component = selectedOption?.value;

  return (
    <div className="flex flex-col h-screen">
      <AppNavBar>
        <div className="flex items-center">
          <CatalogSelect
            options={options}
            label="Select component"
            variant="primary"
            hideLabel
            value={selectedOption}
            onChange={(option) => {
              if (option === null) {
                router.push('/component');
                return;
              }

              router.push(`/component?key=${option.key}`);
            }}
          />
        </div>
      </AppNavBar>
      {component && (
        <SandboxObjectEditorPage
          mode="edit"
          object={component}
          onCloned={(newComponent) => {
            router.push(`/component?key=${newComponent.key}`);
          }}
          onSave={saveObject}
        />
      )}
    </div>
  );
}
