import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, Input, MaterialSymbol } from '../ui';
import { useBoxContext } from '.';
import { BoxContextCustomObjects } from './box-context/sandbox-object/custom';

const exampleAlgorithmString = `import { SandboxParam, createParameterizedAlgorithm } from "@algo-sandbox/core"

const exampleParameterizedAlgorithm = createParameterizedAlgorithm({
  name: 'Decrement counter',
  accepts: 'counter',
  outputs: 'counter',
  parameters: {
    decrement: SandboxParam.integer('Decrement value', 1),
    counterLimit: SandboxParam.integer('Counter limit', -10),
  },
  createInitialState: (problem) => ({ ...problem }),
  getPseudocode: ({ decrement, counterLimit }) => {
    return \`while counter < \${counterLimit}:\n  decrement counter by \${decrement}\nend\`;
  },
  *runAlgorithm({ line, state, parameters: { decrement, counterLimit } }) {
    while (true) {
      yield line(1);
      if (state.counter <= counterLimit) {
        break;
      }
      state.counter -= decrement;
      yield line(2);
    }
    yield line(3);
    return true;
  },
});

export default exampleParameterizedAlgorithm;
`;

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
      typescriptCode:
        selectedObject?.files?.['index.ts'] ?? exampleAlgorithmString,
    },
  });

  useEffect(() => {
    reset({
      name: selectedObject?.name ?? '',
      typescriptCode:
        selectedObject?.files?.['index.ts'] ?? exampleAlgorithmString,
    });
  }, [reset, selectedObject?.files, selectedObject?.name]);

  const isNew = customObjects.selected === null;

  return (
    <aside className="h-full">
      <form
        className="h-full"
        onSubmit={handleSubmit((values) => {
          if (isNew) {
            customObjects.add({
              name: values.name,
              files: {
                'index.ts': values.typescriptCode,
              },
            });
          } else {
            console.log('saving', customObjects.selected?.key);
            console.log(customObjects);
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
        <div className="flex gap-2 p-4 items-end flex-wrap">
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
        <Controller
          control={control}
          name="typescriptCode"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <AlgoSandboxEditor
              path="file:///main.ts"
              value={value}
              onChange={(value) => {
                onChange({
                  target: { value: value ?? '' },
                });
              }}
            />
          )}
        />
      </form>
    </aside>
  );
}
