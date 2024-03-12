import { gridWorldState } from '@algo-sandbox/states';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { ComponentProps, useMemo } from 'react';
import { CellBase, DataViewerComponent, Matrix } from 'react-spreadsheet';
import { z } from 'zod';

import StyledSpreadsheet from '../../../components/box-page/StyledSpreadsheet';

type GridWorld = z.infer<typeof gridWorldState.shape>;
type GridWorldObject = GridWorld['objects'][number];
type GridWorldObjectWithoutPosition = Omit<GridWorldObject, 'x' | 'y'>;

type GridViewerProps = Omit<
  ComponentProps<typeof StyledSpreadsheet>,
  'rowLabels' | 'columnLabels' | 'darkMode' | 'DataViewer' | 'data'
> & {
  width: number;
  height: number;
  objects: GridWorld['objects'];
};

export function gridToTableData({
  width,
  height,
  objects,
}: GridWorld): Matrix<CellBase<Array<GridWorldObjectWithoutPosition>>> {
  const initialData = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      value: [] as GridWorldObjectWithoutPosition[],
      readOnly: true,
    })),
  );

  for (const object of objects) {
    if (object.x >= width || object.y >= height) {
      continue;
    }

    initialData[object.y][object.x] = {
      value: [
        ...initialData[object.y][object.x].value,
        {
          type: object.type,
        },
      ],
      readOnly: true,
    };
  }

  return initialData;
}

export default function GridViewer({
  width,
  height,
  objects,
  ...props
}: GridViewerProps) {
  const data = useMemo(() => {
    return gridToTableData({ width, height, objects });
  }, [height, objects, width]);

  const rowLabels = useMemo(() => {
    return Array.from({ length: height }, (_, index) => index.toString());
  }, [height]);

  const columnLabels = useMemo(() => {
    return Array.from({ length: width }, (_, index) => index.toString());
  }, [width]);

  const { resolvedTheme } = useTheme();

  return (
    <StyledSpreadsheet
      data={data}
      rowLabels={rowLabels}
      columnLabels={columnLabels}
      DataViewer={CellDataViewer}
      darkMode={resolvedTheme === 'dark'}
      {...props}
    />
  );
}

const CellDataViewer: DataViewerComponent<
  CellBase<GridWorldObjectWithoutPosition[]>
> = ({ evaluatedCell }) => {
  const objectTypes = evaluatedCell?.value?.map(({ type }) => type) ?? [];
  return (
    <div
      className={clsx(
        'w-full h-full min-h-[70px] flex justify-center flex-wrap items-center',
        objectTypes.includes('lava') && 'bg-red-200',
        objectTypes.includes('wall') && 'dark:bg-neutral-700 bg-neutral-300',
        'text-on-surface',
      )}
    >
      {objectTypes.includes('ball') && <div>🏀</div>}
      {objectTypes.includes('box') && <div>📦</div>}
      {objectTypes.includes('door') && <div>🚪</div>}
      {objectTypes.includes('key') && <div>🔑</div>}
      {objectTypes.includes('agent') && <div>👤</div>}
      {objectTypes.includes('goal') && <div>🏁</div>}
      {objectTypes.includes('unseen') && (
        <div className="text-label">unseen</div>
      )}
      {objectTypes.includes('empty') && <div className="text-label">empty</div>}
      {objectTypes.includes('floor') && <div className="text-label">floor</div>}
    </div>
  );
};
