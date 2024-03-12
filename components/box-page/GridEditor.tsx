import { gridWorldState } from '@algo-sandbox/states';
import { Button, Input, ResizeHandle } from '@components/ui';
import Checkbox from '@components/ui/Checkbox';
import Dialog from '@components/ui/Dialog';
import Heading from '@components/ui/Heading';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Panel, PanelGroup } from 'react-resizable-panels';
import {
  CellBase,
  DataViewerComponent,
  EmptySelection,
  Matrix,
  Selection,
} from 'react-spreadsheet';
import { z } from 'zod';

import StyledSpreadsheet from './StyledSpreadsheet';

type GridWorld = z.infer<typeof gridWorldState.shape>;
type GridWorldObject = GridWorld['objects'][number];
type GridWorldObjectWithoutPosition = Omit<GridWorldObject, 'x' | 'y'>;

const objectTypes = Object.values(
  gridWorldState.shape.shape.objects.element.shape.type.Values,
);
const objectTypeShortcuts: Record<ObjectType, string> = {
  agent: 'a',
  ball: 'b',
  box: 'x',
  door: 'd',
  empty: 'e',
  floor: 'f',
  goal: 'g',
  key: 'k',
  lava: 'l',
  unseen: 'u',
  wall: 'w',
};

type ObjectType = (typeof objectTypes)[number];

function useShortcuts({
  onCheckedChange,
  objectTypeEnabled,
}: {
  onCheckedChange: (objectType: ObjectType, checked: boolean) => void;
  objectTypeEnabled: Record<ObjectType, boolean | 'indeterminate'>;
}) {
  const toggleAgent = useCallback(() => {
    onCheckedChange('agent', !objectTypeEnabled['agent']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleBall = useCallback(() => {
    onCheckedChange('ball', !objectTypeEnabled['ball']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleBox = useCallback(() => {
    onCheckedChange('box', !objectTypeEnabled['box']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleDoor = useCallback(() => {
    onCheckedChange('door', !objectTypeEnabled['door']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleEmpty = useCallback(() => {
    onCheckedChange('empty', !objectTypeEnabled['empty']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleFloor = useCallback(() => {
    onCheckedChange('floor', !objectTypeEnabled['floor']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleGoal = useCallback(() => {
    onCheckedChange('goal', !objectTypeEnabled['goal']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleKey = useCallback(() => {
    onCheckedChange('key', !objectTypeEnabled['key']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleLava = useCallback(() => {
    onCheckedChange('lava', !objectTypeEnabled['lava']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleUnseen = useCallback(() => {
    onCheckedChange('unseen', !objectTypeEnabled['unseen']);
  }, [objectTypeEnabled, onCheckedChange]);
  const toggleWall = useCallback(() => {
    onCheckedChange('wall', !objectTypeEnabled['wall']);
  }, [objectTypeEnabled, onCheckedChange]);

  useHotkeys('a', toggleAgent, [toggleAgent]);
  useHotkeys('b', toggleBall, [toggleBall]);
  useHotkeys('x', toggleBox, [toggleBox]);
  useHotkeys('d', toggleDoor, [toggleDoor]);
  useHotkeys('e', toggleEmpty, [toggleEmpty]);
  useHotkeys('f', toggleFloor, [toggleFloor]);
  useHotkeys('g', toggleGoal, [toggleGoal]);
  useHotkeys('k', toggleKey, [toggleKey]);
  useHotkeys('l', toggleLava, [toggleLava]);
  useHotkeys('u', toggleUnseen, [toggleUnseen]);
  useHotkeys('w', toggleWall, [toggleWall]);
}

function GridEditor({
  onCancel,
  onGridSave,
  initialGrid,
}: {
  onCancel: () => void;
  initialGrid: GridWorld;
  onGridSave: (grid: GridWorld) => void;
}) {
  const [width, setWidth] = useState(initialGrid.width);
  const [height, setHeight] = useState(initialGrid.height);

  useEffect(() => {
    setWidth(initialGrid.width);
    setHeight(initialGrid.height);
  }, [initialGrid]);

  const rowLabels = useMemo(() => {
    return Array.from({ length: height }, (_, index) => index.toString());
  }, [height]);

  const columnLabels = useMemo(() => {
    return Array.from({ length: width }, (_, index) => index.toString());
  }, [width]);

  const initialData: Matrix<CellBase<Array<GridWorldObjectWithoutPosition>>> =
    useMemo(() => {
      const initialData = Array.from({ length: initialGrid.height }, () =>
        Array.from({ length: initialGrid.width }, () => ({
          value: [] as GridWorldObjectWithoutPosition[],
          readOnly: true,
        })),
      );

      for (const object of initialGrid.objects) {
        if (object.x >= initialGrid.width || object.y >= initialGrid.height) {
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
    }, [initialGrid.height, initialGrid.objects, initialGrid.width]);

  const [data, setData] = useState(initialData);

  const { resolvedTheme } = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<{
    width: number;
    height: number;
  }>({
    defaultValues: {
      width,
      height,
    },
  });

  const onWidthChange = useCallback(
    (newWidth: number) => {
      setWidth(newWidth);
      setData((prevData) => {
        const newData = Array.from({ length: height }, (_, row) =>
          Array.from({ length: newWidth }, (_, column) => {
            if (column < prevData[row].length) {
              return prevData[row][column];
            }

            return {
              value: [],
              readOnly: true,
            };
          }),
        );

        return newData;
      });
    },
    [height],
  );

  const onHeightChange = useCallback(
    (newHeight: number) => {
      setHeight(newHeight);
      setData((prevData) => {
        const newData = Array.from({ length: newHeight }, (_, row) =>
          Array.from({ length: width }, (_, column) => {
            if (row < prevData.length) {
              return prevData[row][column];
            }

            return {
              value: [],
              readOnly: true,
            };
          }),
        );

        return newData;
      });
    },
    [width],
  );

  const [selection, setSelection] = useState<Selection>(new EmptySelection());
  const [preBlurSelection, setPreBlurSelection] = useState<Selection>(
    new EmptySelection(),
  );

  const selectionRange = useMemo(() => {
    return selection.toRange(data);
  }, [data, selection]);

  const onCheckedChange = useCallback(
    (objectType: ObjectType, checked: boolean) => {
      setData((prevData) => {
        const range = selectionRange ?? preBlurSelection.toRange(prevData);

        if (range === null) {
          return prevData;
        }

        const newData = [...prevData.map((row) => [...row])];

        for (const point of range) {
          const oldPoint = prevData.at(point.row)?.at(point.column);

          if (checked) {
            if (oldPoint?.value.some((object) => object.type === objectType)) {
              continue;
            }

            newData[point.row][point.column] = {
              ...newData.at(point.row)?.at(point.column),
              value: [
                ...(newData.at(point.row)?.at(point.column)?.value ?? []),
                {
                  type: objectType,
                },
              ],
            };
          } else {
            newData[point.row][point.column] = {
              ...newData.at(point.row)?.at(point.column),
              value:
                newData
                  .at(point.row)
                  ?.at(point.column)
                  ?.value.filter((object) => object.type !== objectType) ?? [],
            };
          }
        }

        return newData;
      });
    },
    [preBlurSelection, selectionRange],
  );

  const onSaveClick = useCallback(() => {
    const grid: GridWorld = {
      width,
      height,
      objects: data.flatMap((row, y) =>
        row.flatMap(
          (cell, x) =>
            cell?.value.flatMap((object) => ({
              ...object,
              x,
              y,
            })) ?? [],
        ),
      ),
    };

    onGridSave(grid);
  }, [data, height, onGridSave, width]);

  const objectTypeEnabled = useMemo(() => {
    return Object.fromEntries(
      objectTypes.map((objectType) => {
        if (selectionRange === null) {
          return [objectType, false];
        }

        const hasObjectType = Array(...selectionRange).map((point) => {
          const dataPoint = data.at(point.row)?.at(point.column);
          if (dataPoint === undefined) {
            return false;
          }

          return dataPoint.value.some((object) => object.type === objectType);
        });

        const checked = hasObjectType.every((value) => value)
          ? true
          : hasObjectType.some((value) => value)
          ? 'indeterminate'
          : false;

        return [objectType, checked];
      }),
    ) as Record<ObjectType, boolean | 'indeterminate'>;
  }, [data, selectionRange]);

  useShortcuts({
    onCheckedChange,
    objectTypeEnabled,
  });

  return (
    <PanelGroup
      direction="horizontal"
      className="w-full h-full flex-1 overflow-hidden"
    >
      <Panel className="flex flex-col gap-y-2 p-2" defaultSize={30}>
        <div className="flex flex-col gap-y-4 p-2">
          <form
            onSubmit={handleSubmit((values) => {
              onWidthChange(values.width);
              onHeightChange(values.height);
              reset(values);
            })}
            className="space-y-4"
          >
            <Input label="Width" type="number" {...register('width')} />
            <Input label="Height" type="number" {...register('height')} />
            <Button
              label="Update"
              type="submit"
              variant="filled"
              disabled={!isDirty}
            />
          </form>
          <div className="flex flex-col gap-y-2">
            <Heading variant="h4">Objects</Heading>
            {objectTypes.map((objectType) => (
              <div className="flex gap-2" key={objectType}>
                <Checkbox
                  label={objectType}
                  checked={objectTypeEnabled[objectType]}
                  onFocus={() => {
                    setSelection(preBlurSelection);
                  }}
                  onChange={(checked) => {
                    onCheckedChange(objectType, checked);
                  }}
                />
                <div className="flex capitalize rounded w-6 h-6 justify-center items-center border text-label">
                  {objectTypeShortcuts[objectType]}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button label="Cancel" onClick={onCancel} />
            <Button label="Save" variant="primary" onClick={onSaveClick} />
          </div>
        </div>
      </Panel>
      <ResizeHandle />
      <Panel className="overflow-auto">
        <StyledSpreadsheet
          data={data}
          onBlur={() => {
            setPreBlurSelection(selection);
          }}
          rowLabels={rowLabels}
          columnLabels={columnLabels}
          DataViewer={CellDataViewer}
          darkMode={resolvedTheme === 'dark'}
          selected={selection}
          onSelect={(newSelection) => {
            if (newSelection.size(data) === 0) {
              return;
            }

            setSelection(newSelection);
          }}
        />
      </Panel>
    </PanelGroup>
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

export default function GridEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  const initialGrid = useMemo(() => {
    try {
      return gridWorldState.shape.parse(JSON.parse(value));
    } catch {
      return {
        width: 10,
        height: 10,
        objects: [],
      };
    }
  }, [value]);

  const onGridSave = useCallback(
    (grid: GridWorld) => {
      onChange(JSON.stringify(grid));
      onOpenChange(false);
    },
    [onChange, onOpenChange],
  );

  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog
      title="Grid editor"
      content={
        <GridEditor
          initialGrid={initialGrid}
          onGridSave={onGridSave}
          onCancel={onCancel}
        />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
