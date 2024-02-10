'use client';

import SandboxObjectEditorPage from '@app/SandboxObjectEditorPage';
import AppNavBar from '@components/AppNavBar';
import CatalogSelect from '@components/box-page/app-bar/CatalogSelect';
import { useBuiltInComponents } from '@components/playground/BuiltInComponentsProvider';
import { CatalogGroup } from '@constants/catalog';
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
  } = useBuiltInComponents();

  const { mutateAsync: saveObject } = useSaveObjectMutation();

  const options = useMemo(
    () =>
      [
        ...adapterOptions.map((group) => ({
          key: `adapters-${group.key}`,
          label: `Adapters: ${group.label}`,
          options: group.options,
        })),
        ...algorithmOptions.map((group) => ({
          key: `algorithms-${group.key}`,
          label: `Algorithms: ${group.label}`,
          options: group.options,
        })),
        ...problemOptions.map((group) => ({
          key: `problems-${group.key}`,
          label: `Problems: ${group.label}`,
          options: group.options,
        })),
        ...visualizerOptions.map((group) => ({
          key: `visualizers-${group.key}`,
          label: `Visualizers: ${group.label}`,
          options: group.options,
        })),
      ] as Array<CatalogGroup<DbSandboxObjectSaved>>,
    [adapterOptions, algorithmOptions, problemOptions, visualizerOptions],
  );

  const selectedOption = useMemo(() => {
    const flattenedOptions = options.flatMap((group) => group.options);
    return flattenedOptions.find((option) => option.key === componentKey);
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
              router.push(`/component?key=${option.key}`);
            }}
          />
        </div>
      </AppNavBar>
      {component && (
        <SandboxObjectEditorPage
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
