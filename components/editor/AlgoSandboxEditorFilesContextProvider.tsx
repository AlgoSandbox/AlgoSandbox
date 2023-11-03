import { createContext, useContext } from 'react';

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
  return (
    <AlgoSandboxEditorFilesContext.Provider
      value={{
        algoSandboxFiles,
        typeDeclarations,
      }}
    >
      {children}
    </AlgoSandboxEditorFilesContext.Provider>
  );
}
