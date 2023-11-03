import { MaterialSymbol } from '@components/ui';
import { buildDirectory } from '@utils/buildDirectory';
import clsx from 'clsx';
import { createContext, useContext, useState } from 'react';

import {
  BoxExplorerDirectory,
  BoxExplorerFile,
  BoxExplorerItem,
} from '../../typings/directory';

export type DirectoryExplorerProps = {
  className?: string;
  files: Record<string, string>;
  onFileClick: (file: BoxExplorerFile) => void;
  activeFile: BoxExplorerFile | null;
};

function isDirectory(item: BoxExplorerItem): item is BoxExplorerDirectory {
  return item.type === 'directory';
}

type DirectoryExplorerItemProps = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
};

function DirectoryExplorerItem({
  label,
  icon,
  onClick,
  selected,
}: DirectoryExplorerItemProps) {
  return (
    <button
      className={clsx(
        'flex gap-2 px-2 py-2 hover:bg-primary-200',
        selected && 'text-primary-700 bg-primary-100'
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function DirectoryExplorerFile({ file }: { file: BoxExplorerFile }) {
  const { onFileClick, activeFile } = useDirectoryExplorerContext();
  return (
    <DirectoryExplorerItem
      label={file.name}
      icon={<MaterialSymbol icon="draft" />}
      onClick={() => {
        onFileClick(file);
      }}
      selected={activeFile?.path === file.path}
    />
  );
}

function DirectoryExplorerDirectory({
  directory,
}: {
  directory: BoxExplorerDirectory;
}) {
  const { isDirectoryExpanded, expandDirectory, collapseDirectory } =
    useDirectoryExplorerContext();
  const isExpanded = isDirectoryExpanded(directory.path);

  return (
    <>
      {directory.path !== '.' && (
        <DirectoryExplorerItem
          key={directory.path}
          label={directory.name}
          icon={<MaterialSymbol icon="folder" />}
          onClick={() => {
            if (isExpanded) {
              collapseDirectory(directory.path);
            } else {
              expandDirectory(directory.path);
            }
          }}
        />
      )}
      {isExpanded &&
        directory.items.map((item) =>
          isDirectory(item) ? (
            <DirectoryExplorerDirectory key={item.path} directory={item} />
          ) : (
            <DirectoryExplorerFile key={item.path} file={item} />
          )
        )}
    </>
  );
}

type DirectoryExplorerContextType = {
  isDirectoryExpanded: (directoryPath: string) => boolean;
  expandDirectory: (directoryPath: string) => void;
  collapseDirectory: (directoryPath: string) => void;
  onFileClick: (file: BoxExplorerFile) => void;
  activeFile: BoxExplorerFile | null;
};

const DirectoryExplorerContext = createContext<DirectoryExplorerContextType>({
  isDirectoryExpanded: () => false,
  expandDirectory: () => {},
  collapseDirectory: () => {},
  onFileClick: () => {},
  activeFile: null,
});

function useDirectoryExplorerContext() {
  return useContext(DirectoryExplorerContext);
}

export default function DirectoryExplorer({
  className,
  files,
  onFileClick,
  activeFile,
}: DirectoryExplorerProps) {
  const directory = buildDirectory(files);

  const [expandedDirectoryPaths, setExpandedDirectoryPaths] = useState(['.']);

  return (
    <DirectoryExplorerContext.Provider
      value={{
        activeFile,
        onFileClick,
        isDirectoryExpanded: (directoryPath) =>
          expandedDirectoryPaths.includes(directoryPath),
        expandDirectory: (directoryPath) => {
          setExpandedDirectoryPaths([...expandedDirectoryPaths, directoryPath]);
        },
        collapseDirectory: (directoryPath) => {
          setExpandedDirectoryPaths(
            expandedDirectoryPaths.filter((path) => path !== directoryPath)
          );
        },
      }}
    >
      <div className={clsx(className, 'flex flex-col')}>
        <span className="font-mono text-neutral-500 px-4 py-2 border-b">
          File explorer
        </span>
        <DirectoryExplorerDirectory directory={directory} />
      </div>
    </DirectoryExplorerContext.Provider>
  );
}