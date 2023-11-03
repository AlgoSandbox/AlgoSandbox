export type BoxExplorerItem = BoxExplorerDirectory | BoxExplorerFile;

export type BoxExplorerFile = {
  name: string;
  path: string;
  type: 'file';
  contents: string;
};

export type BoxExplorerDirectory = {
  name: string;
  path: string;
  items: Array<BoxExplorerItem>;
  type: 'directory';
};
