import { Editor } from '@monaco-editor/react';
import { useBoxContext } from '.';
import { Button, Input, MaterialSymbol } from '@components';
import { useEffect, useState } from 'react';
import { TypeDeclaration } from '../page';
import { Controller, useForm } from 'react-hook-form';

const exampleAlgorithmString = `import { SandboxParam, createParameteredAlgorithm } from "@algo-sandbox/core"

const exampleParameteredAlgorithm = createParameteredAlgorithm({
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

export default exampleParameteredAlgorithm;
`;

type EditorPanelFormValue = {
  name: string;
  typescriptCode: string;
};

export type SandboxObjectEditorPanelProps = {
  typeDeclarations: Array<TypeDeclaration>;
};

export default function SandboxObjectEditorPanel({
  typeDeclarations,
}: SandboxObjectEditorPanelProps) {
  const customAlgorithms = useBoxContext('algorithm.custom');

  const {
    control,
    reset,
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EditorPanelFormValue>({
    defaultValues: {
      name: customAlgorithms.selected?.name ?? '',
      typescriptCode:
        customAlgorithms.selected?.typescriptCode ?? exampleAlgorithmString,
    },
  });

  useEffect(() => {
    reset({
      name: customAlgorithms.selected?.name ?? '',
      typescriptCode:
        customAlgorithms.selected?.typescriptCode ?? exampleAlgorithmString,
    });
  }, [
    reset,
    customAlgorithms.selected?.name,
    customAlgorithms.selected?.typescriptCode,
  ]);

  const isNew = customAlgorithms.selected === null;

  return (
    <aside className="w-[500px]">
      <form
        className="h-full"
        onSubmit={handleSubmit((values) => {
          if (isNew) {
            customAlgorithms.add(values);
          } else {
            customAlgorithms.set({
              key: customAlgorithms.selected!.key,
              ...values,
            });
          }
          reset(values);
        })}
      >
        <div className="flex gap-2 p-4 items-end">
          <Input
            label="Name"
            containerClassName="flex-1"
            {...register('name', { required: true })}
          />
          <Button
            label={isNew ? 'Save as new' : 'Save'}
            variant="primary"
            type="submit"
            disabled={!isDirty}
          />
          {!isNew && (
            <Button
              label="Delete"
              hideLabel
              icon={<MaterialSymbol icon="delete" />}
              onClick={() => {
                customAlgorithms.remove(customAlgorithms.selected!);
              }}
            />
          )}
        </div>
        <Controller
          control={control}
          name="typescriptCode"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Editor
              language="typescript"
              path="file:///main.ts"
              value={value}
              onChange={(value) => {
                onChange({
                  target: { value: value ?? '' },
                });
              }}
              keepCurrentModel={false}
              beforeMount={(monaco) => {
                monaco.editor.getModels().forEach((model) => model.dispose());
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                  {
                    target: monaco.languages.typescript.ScriptTarget.ES2016,
                    allowNonTsExtensions: true,
                    moduleResolution:
                      monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.CommonJS,
                    noEmit: true,
                    typeRoots: ['node_modules/@types'],
                    baseUrl: '.',
                    paths: {
                      '@algo-sandbox/*': ['file:///lib/algo-sandbox/*'],
                    },
                  }
                );
                for (const { contents, path } of typeDeclarations) {
                  monaco.editor.createModel(
                    contents,
                    'typescript',
                    monaco.Uri.parse(path)
                  );
                }
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                  {
                    noSemanticValidation: false,
                    noSyntaxValidation: false,
                    noSuggestionDiagnostics: false,
                  }
                );
                monaco.languages.typescript.javascriptDefaults.setEagerModelSync(
                  true
                );
              }}
            />
          )}
        />
      </form>
    </aside>
  );
}
