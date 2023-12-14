import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

import { useAlgoSandboxEditorFilesContext } from './AlgoSandboxEditorFilesContextProvider';

type AlgoSandboxEditorProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  files: Record<string, string>;
  path: string;
};

export default function AlgoSandboxEditor({
  value,
  onChange,
  files,
  path,
}: AlgoSandboxEditorProps) {
  const { resolvedTheme } = useTheme();
  const { algoSandboxFiles } = useAlgoSandboxEditorFilesContext();

  return (
    <Editor
      language="typescript"
      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
      path={path}
      value={value}
      onChange={onChange}
      keepCurrentModel={false}
      beforeMount={(monaco) => {
        monaco.editor.getModels().forEach((model) => model.dispose());
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
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
        });
        for (const { contents, path } of algoSandboxFiles) {
          monaco.editor.createModel(
            contents,
            undefined,
            monaco.Uri.parse(path),
          );
        }
        for (const [path, contents] of Object.entries(files)) {
          monaco.editor.createModel(
            contents,
            undefined,
            monaco.Uri.parse(path),
          );
        }

        // for (const { contents, path } of typeDeclarations) {
        //   monaco.languages.typescript.typescriptDefaults.addExtraLib(
        //     contents,
        //     path
        //   );
        // }
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: false,
        });
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
      }}
    />
  );
}
