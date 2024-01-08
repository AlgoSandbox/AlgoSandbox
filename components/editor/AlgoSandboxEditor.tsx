import { Editor, useMonaco } from '@monaco-editor/react';
import { useQueries } from '@tanstack/react-query';
import getImportNames from '@utils/npm-fetcher/getImportNames';
import getTypeDefinitionsWithWorker from '@utils/npm-fetcher/getTypeDefinitionsWithWorker';
import * as EsModuleLexer from 'es-module-lexer';
import { debounce } from 'lodash';
import { useTheme } from 'next-themes';
import _path from 'path';
import { useEffect, useMemo, useState } from 'react';

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

  const onValueChange = useMemo(() => {
    return debounce((value: string) => {
      setInternalValue(value);
    }, 1000);
  }, []);

  useEffect(() => {
    onValueChange(value ?? '');
  }, [onValueChange, value]);

  const importNames = useMemo(() => {
    if (!isParserInitialized) {
      return [];
    }

    return getImportNames(internalValue).filter(
      (name) => !name.startsWith('@algo-sandbox'),
    );
  }, [internalValue, isParserInitialized]);

  const libDeclarationQueries = useQueries({
    queries: importNames.map((name) => {
      return {
        queryKey: ['packages', name],
        queryFn: () => getTypeDefinitionsWithWorker(name),
        staleTime: Infinity,
      };
    }),
  });

  const libDeclarations = useMemo(() => {
    const flattenedTypeDefinitions: Record<string, string> = {};

    for (const { data } of libDeclarationQueries) {
      if (data === undefined) {
        continue;
      }

      for (const [packageName, files] of Object.entries(data)) {
        for (const [filePath, contents] of Object.entries(files)) {
          flattenedTypeDefinitions[
            'file:///' + _path.join('node_modules/', packageName, filePath)
          ] = contents;
        }
      }
    }

    return flattenedTypeDefinitions;
  }, [libDeclarationQueries]);

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
  }, [libDeclarations, monaco]);

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
          esModuleInterop: true,
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
