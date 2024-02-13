import { MaterialSymbol } from '@components/ui';
import { buildDirectory } from '@utils/buildDirectory';
import clsx from 'clsx';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  BoxExplorerDirectory,
  BoxExplorerFile,
  BoxExplorerItem,
} from '../../typings/directory';

export type DirectoryExplorerProps = {
  className?: string;
  files: Record<string, string>;
  onFileClick: (file: BoxExplorerFile) => void;
  activePath: string | null;
};

function isDirectory(item: BoxExplorerItem): item is BoxExplorerDirectory {
  return item.type === 'directory';
}

type DirectoryExplorerItemProps = {
  label: string;
  level: number;
  icon: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
};

function DirectoryExplorerItem({
  label,
  level,
  icon,
  onClick,
  selected,
}: DirectoryExplorerItemProps) {
  return (
    <button
      type="button"
      className={clsx(
        'flex gap-2 pe-2 py-2 hover:bg-surface-high',
        selected && 'text-accent bg-surface-high',
      )}
      style={{
        paddingInlineStart: `${(level + 1) * 8}px`,
      }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function DirectoryExplorerFile({
  file,
  level,
}: {
  file: BoxExplorerFile;
  level: number;
}) {
  const { onFileClick, activePath } = useDirectoryExplorerContext();
  return (
    <DirectoryExplorerItem
      label={file.name}
      level={level}
      icon={<MaterialSymbol icon="draft" />}
      onClick={() => {
        onFileClick(file);
      }}
      selected={activePath === file.path}
    />
  );
}

function DirectoryExplorerDirectory({
  directory,
  level,
}: {
  directory: BoxExplorerDirectory;
  level: number;
}) {
  const { isDirectoryExpanded, expandDirectory, collapseDirectory } =
    useDirectoryExplorerContext();
  const isExpanded = isDirectoryExpanded(directory.path);

  return (
    <>
      {directory.path !== '.' && (
        <DirectoryExplorerItem
          level={level}
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
            <DirectoryExplorerDirectory
              key={item.path}
              directory={item}
              level={level + 1}
            />
          ) : (
            <DirectoryExplorerFile
              key={item.path}
              file={item}
              level={level + 1}
            />
          ),
        )}
    </>
  );
}

type DirectoryExplorerContextType = {
  isDirectoryExpanded: (directoryPath: string) => boolean;
  expandDirectory: (directoryPath: string) => void;
  collapseDirectory: (directoryPath: string) => void;
  onFileClick: (file: BoxExplorerFile) => void;
  activePath: string | null;
};

const DirectoryExplorerContext = createContext<DirectoryExplorerContextType>({
  isDirectoryExpanded: () => false,
  expandDirectory: () => {},
  collapseDirectory: () => {},
  onFileClick: () => {},
  activePath: null,
});

function useDirectoryExplorerContext() {
  return useContext(DirectoryExplorerContext);
}

export default function DirectoryExplorer({
  className,
  files,
  onFileClick,
  activePath,
}: DirectoryExplorerProps) {
  const directory = useMemo(() => buildDirectory(files), [files]);

  const [expandedDirectoryPaths, setExpandedDirectoryPaths] = useState<
    Array<string>
  >([]);

  useEffect(() => {
    const getDirectoryPaths = (
      directory: BoxExplorerDirectory,
    ): Array<string> => {
      return [
        directory.path,
        ...directory.items.flatMap((item) =>
          isDirectory(item) ? getDirectoryPaths(item) : [],
        ),
      ];
    };

    const directoryPaths = getDirectoryPaths(directory);
    setExpandedDirectoryPaths(directoryPaths);
  }, [directory]);

  return (
    <DirectoryExplorerContext.Provider
      value={{
        activePath,
        onFileClick,
        isDirectoryExpanded: (directoryPath) =>
          expandedDirectoryPaths.includes(directoryPath),
        expandDirectory: (directoryPath) => {
          setExpandedDirectoryPaths([...expandedDirectoryPaths, directoryPath]);
        },
        collapseDirectory: (directoryPath) => {
          setExpandedDirectoryPaths(
            expandedDirectoryPaths.filter((path) => path !== directoryPath),
          );
        },
      }}
    >
      <div className={clsx(className, 'flex flex-col')}>
        <span className="font-mono text-label px-4 py-2 border-b">
          File explorer
        </span>
        <DirectoryExplorerDirectory directory={directory} level={-1} />
      </div>
    </DirectoryExplorerContext.Provider>
  );
}
