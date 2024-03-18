import GridViewer, {
  gridToTableData,
} from '@algo-sandbox/react-components/GridViewer';
import { gridWorldState } from '@algo-sandbox/states';
import {
  Button,
  Checkbox,
  Dialog,
  Heading,
  Input,
  ResizeHandle,
} from '@components/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { EmptySelection, Selection } from 'react-spreadsheet';
import { z } from 'zod';

type GridWorld = z.infer<typeof gridWorldState.shape>;

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

  const [objects, setObjects] = useState(initialGrid.objects);

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

  const [selection, setSelection] = useState<Selection>(new EmptySelection());
  const [preBlurSelection, setPreBlurSelection] = useState<Selection>(
    new EmptySelection(),
  );

  const onCheckedChange = useCallback(
    (objectType: ObjectType, checked: boolean) => {
      setObjects((prevObjects) => {
        const prevData = gridToTableData({
          width,
          height,
          objects: prevObjects,
        });

        const range =
          selection.toRange(prevData) ?? preBlurSelection.toRange(prevData);

        if (range === null) {
          return prevObjects;
        }

        if (checked) {
          const newObjects = [...prevObjects];

          for (const point of range) {
            const { column: x, row: y } = point;
            const hasObject = newObjects.some(
              (obj) => obj.x === x && obj.y === y && obj.type === objectType,
            );

            if (hasObject) {
              continue;
            }

            newObjects.push({ x, y, type: objectType });
          }

          return newObjects;
        } else {
          return prevObjects.filter((obj) => {
            return !Array(...range).some((point) => {
              return (
                obj.x === point.column &&
                obj.y === point.row &&
                obj.type === objectType
              );
            });
          });
        }
      });
    },
    [width, height, selection, preBlurSelection],
  );

  const onSaveClick = useCallback(() => {
    const grid: GridWorld = {
      width,
      height,
      objects,
    };

    onGridSave(grid);
  }, [height, objects, onGridSave, width]);

  const objectTypeEnabled = useMemo(() => {
    const selectionRange = selection.toRange(
      gridToTableData({ width, height, objects }),
    );

    return Object.fromEntries(
      objectTypes.map((objectType) => {
        if (selectionRange === null) {
          return [objectType, false];
        }

        const hasObjectType = Array(...selectionRange).map((point) => {
          return objects.some(
            (obj) =>
              obj.x === point.column &&
              obj.y === point.row &&
              obj.type === objectType,
          );
        });

        const checked = hasObjectType.every((value) => value)
          ? true
          : hasObjectType.some((value) => value)
          ? 'indeterminate'
          : false;

        return [objectType, checked];
      }),
    ) as Record<ObjectType, boolean | 'indeterminate'>;
  }, [height, objects, selection, width]);

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
              setWidth(values.width);
              setHeight(values.height);
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
        <GridViewer
          width={width}
          height={height}
          objects={objects}
          onBlur={() => {
            setPreBlurSelection(selection);
          }}
          selected={selection}
          onSelect={(newSelection) => {
            const data = gridToTableData({ width, height, objects });
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
