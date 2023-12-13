import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, Input, MaterialSymbol } from '../ui';
import { useBoxContext } from '.';
import { BoxContextCustomObjects } from './box-context/sandbox-object/custom';

type EditorPanelFormValue = {
  name: string;
  typescriptCode: string;
};

export type SandboxObjectEditorPanelProps = {
  customObjects: BoxContextCustomObjects;
};

export default function SandboxObjectEditorPanel({
  customObjects,
}: SandboxObjectEditorPanelProps) {
  const selectedAlgorithm = useBoxContext('algorithm.select.value');
  const selectedProblem = useBoxContext('problem.select.value');
  const selectedVisualizer = useBoxContext('visualizer.select.value');
  const customPanelType = useBoxContext('customPanelType');

  const selectedValue = (() => {
    switch (customPanelType) {
      case 'algorithm':
        return selectedAlgorithm;
      case 'problem':
        return selectedProblem;
      case 'visualizer':
        return selectedVisualizer;
    }
  })();

  const selectedObject = selectedValue?.value;

  const {
    control,
    reset,
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EditorPanelFormValue>({
    defaultValues: {
      name: selectedObject?.name ?? '',
      typescriptCode: selectedObject?.files?.['index.ts'] ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: selectedObject?.name ?? '',
      typescriptCode: selectedObject?.files?.['index.ts'] ?? '',
    });
  }, [reset, selectedObject?.files, selectedObject?.name]);

  const isNew = customObjects.selected === null;

  return (
    <aside className="h-full">
      <form
        className="flex flex-col h-full"
        onSubmit={handleSubmit((values) => {
          if (isNew) {
            customObjects.add({
              name: values.name,
              files: {
                'index.ts': values.typescriptCode,
              },
            });
          } else {
            customObjects.set({
              key: customObjects.selected!.key,
              name: values.name,
              files: {
                'index.ts': values.typescriptCode,
              },
            });
          }
          reset(values);
        })}
      >
        <div className="flex flex-shrink-0 gap-2 p-4 items-end flex-wrap">
          <Input
            label="Name"
            containerClassName="flex-1"
            {...register('name', { required: true })}
          />
          <Button
            label={isNew ? 'Save as custom' : 'Save'}
            variant="primary"
            type="submit"
            disabled={!isDirty && !isNew}
          />
          {!isNew && (
            <Button
              label="Delete"
              hideLabel
              icon={<MaterialSymbol icon="delete" />}
              onClick={() => {
                customObjects.remove(customObjects.selected!);
              }}
            />
          )}
        </div>
        <div className="flex-1">
          <Controller
            control={control}
            name="typescriptCode"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <AlgoSandboxEditor
                path="file:///index.ts"
                files={selectedObject?.files ?? {}}
                value={value}
                onChange={(value) => {
                  onChange({
                    target: { value: value ?? '' },
                  });
                }}
              />
            )}
          />
        </div>
      </form>
    </aside>
  );
}
