import { Editor } from '@monaco-editor/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { TypeDeclaration } from '../../app/page';
import { Button, Input, MaterialSymbol } from '../ui';
import { useBoxContext } from '.';
import { BoxContextCustomObjects } from './box-context/sandbox-object/custom';

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
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
  customObjects: BoxContextCustomObjects;
};

export default function SandboxObjectEditorPanel({
  algoSandboxFiles,
  customObjects,
  typeDeclarations,
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
      typescriptCode: selectedObject?.typescriptCode ?? exampleAlgorithmString,
    },
  });

  useEffect(() => {
    reset({
      name: selectedObject?.name ?? '',
      typescriptCode: selectedObject?.typescriptCode ?? exampleAlgorithmString,
    });
  }, [reset, selectedObject?.name, selectedObject?.typescriptCode]);

  const isNew = customObjects.selected === null;

  return (
    <aside className="h-full">
      <form
        className="h-full"
        onSubmit={handleSubmit((values) => {
          if (isNew) {
            customObjects.add(values);
          } else {
            customObjects.set({
              key: customObjects.selected!.key,
              ...values,
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
                    strict: true,
                    moduleResolution:
                      monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.CommonJS,
                    noEmit: true,
                    baseUrl: '.',
                    paths: {
                      '@algo-sandbox/*': ['file:///lib/algo-sandbox/*'],
                    },
                  }
                );
                for (const { contents, path } of algoSandboxFiles) {
                  monaco.editor.createModel(
                    contents,
                    'typescript',
                    monaco.Uri.parse(path)
                  );
                }

                for (const { contents, path } of typeDeclarations) {
                  monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    contents,
                    path
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
