import { createContext, useContext, useMemo } from 'react';

import { TypeDeclaration } from '../../app/page';

type AlgoSandboxEditorFilesContextType = {
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
};

const AlgoSandboxEditorFilesContext =
  createContext<AlgoSandboxEditorFilesContextType>({
    algoSandboxFiles: [],
    typeDeclarations: [],
  });

export function useAlgoSandboxEditorFilesContext() {
  return useContext(AlgoSandboxEditorFilesContext);
}

type AlgoSandboxEditorFilesContextProviderProps = {
  children: React.ReactNode;
  algoSandboxFiles: Array<TypeDeclaration>;
  typeDeclarations: Array<TypeDeclaration>;
};

export default function AlgoSandboxEditorFilesContextProvider({
  children,
  algoSandboxFiles,
  typeDeclarations,
}: AlgoSandboxEditorFilesContextProviderProps) {
  const value = useMemo(
    () => ({
      algoSandboxFiles,
      typeDeclarations,
    }),
    [algoSandboxFiles, typeDeclarations],
  );

  return (
    <AlgoSandboxEditorFilesContext.Provider value={value}>
      {children}
    </AlgoSandboxEditorFilesContext.Provider>
  );
}
