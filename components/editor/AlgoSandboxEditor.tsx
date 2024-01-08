import { Editor, useMonaco } from '@monaco-editor/react';
import getImportNames from '@utils/npm-fetcher/getImportNames';
import getTypeDefinitions from '@utils/npm-fetcher/getTypeDefinitions';
import * as EsModuleLexer from 'es-module-lexer';
import { throttle } from 'lodash';
import { useTheme } from 'next-themes';
import _path from 'path';
import { useCallback, useEffect, useState } from 'react';

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

  const [isParserInitialized, setIsParserInitialized] = useState(false);

  useEffect(() => {
    EsModuleLexer.init.then(() => {
      setIsParserInitialized(true);
    });
  }, [isParserInitialized]);

  const [internalValue, setInternalValue] = useState(value ?? '');

  const onValueChange = useCallback(
    throttle((value: string) => {
      setInternalValue(value);
    }, 1000),
    [],
  );

  useEffect(() => {
    onValueChange(value ?? '');
  }, [onValueChange, value]);

  const [libDeclarations, setLibDeclarations] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!isParserInitialized) {
      return;
    }

    try {
      const importNames = getImportNames(internalValue).filter(
        (name) => !name.startsWith('@algo-sandbox'),
      );

      (async () => {
        const files: Record<string, string> = {};
        await Promise.all(
          importNames.map(async (name) => {
            const typeDefinitions = await getTypeDefinitions(name);

            const flattenedTypeDefinitions: Record<string, string> = {};

            for (const [packageName, files] of Object.entries(
              typeDefinitions,
            )) {
              for (const [filePath, contents] of Object.entries(files)) {
                flattenedTypeDefinitions[
                  'file:///' +
                    _path.join('node_modules/', packageName, filePath)
                ] = contents;
              }
            }

            Object.assign(files, flattenedTypeDefinitions);
          }),
        );

        setLibDeclarations(files);
      })();
    } catch (e) {
      console.error(e);
    }
  }, [internalValue, isParserInitialized]);

  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) {
      return;
    }

    const extraLibs = Object.entries(libDeclarations).map(
      ([filePath, content]) => ({
        filePath,
        content,
      }),
    );

    monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs);
  }, [libDeclarations]);

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

        for (const [path, contents] of Object.entries(libDeclarations)) {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            contents,
            path,
          );
        }
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
