import { createContext, useContext, useMemo } from 'react';

import { TypeDeclaration } from '../../app/page';

type AlgoSandboxEditorFilesContextType = {
  algoSandboxFiles: Array<TypeDeclaration>;
  files: Record<string, string>;
  typeDeclarations: Array<TypeDeclaration>;
};

const AlgoSandboxEditorFilesContext =
  createContext<AlgoSandboxEditorFilesContextType>({
    algoSandboxFiles: [],
    files: {},
    typeDeclarations: [],
  });

export function useAlgoSandboxEditorFilesContext() {
  return useContext(AlgoSandboxEditorFilesContext);
}

type AlgoSandboxEditorFilesContextProviderProps = {
  children: React.ReactNode;
  algoSandboxFiles: Array<TypeDeclaration>;
  files: Record<string, string>;
  typeDeclarations: Array<TypeDeclaration>;
};

export default function AlgoSandboxEditorFilesContextProvider({
  children,
  algoSandboxFiles,
  files,
  typeDeclarations,
}: AlgoSandboxEditorFilesContextProviderProps) {

  const value = useMemo(() => ({
    algoSandboxFiles,
    files,
    typeDeclarations,
  }), [algoSandboxFiles, files, typeDeclarations]);

  return (
    <AlgoSandboxEditorFilesContext.Provider
      value={value}
    >
      {children}
    </AlgoSandboxEditorFilesContext.Provider>
  );
}
