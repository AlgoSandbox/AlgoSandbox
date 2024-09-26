import '@silevis/reactgrid/styles.css';

import { Button, MaterialSymbol, ResizeHandle } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Separator } from '@radix-ui/react-select';
import {
  Cell,
  CellTemplate,
  Column,
  getCellProperty,
  ReactGrid,
  Row,
} from '@silevis/reactgrid';
import clsx from 'clsx';
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import React from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

function GridEditor({
  onCancel,
  onSave,
  initialData,
}: {
  onCancel: () => void;
  initialData: [
    Array<Array<Array<Record<string, unknown>>>>,
    Array<[string, string]>,
  ];
  onSave: (
    data: [
      Array<Array<Array<Record<string, unknown>>>>,
      Array<[string, string]>,
    ],
  ) => void;
}) {
  // const draggableLabels = Object.values(
  //   gridWorldState.shape.shape.objects.element.shape.type.Values,
  // );
  const labelToIconNameMap = initialData[1].reduce(
    (map, [iconName, label]) => map.set(label, iconName),
    new Map<string, string>(),
  );

  const Droppable = (props: {
    id: string;
    className?: string;
    children?: React.ReactNode;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  }) => {
    const { setNodeRef } = useDroppable({
      id: props.id,
    });

    return (
      <div
        ref={setNodeRef}
        className={props.className}
        onMouseEnter={props.onMouseEnter}
      >
        {props.children}
      </div>
    );
  };

  type DraggableButtonProps = {
    label: string;
    iconName: string;
    hideLabel?: boolean;
    onRightClickCallback?: () => void;
    hidden?: boolean;
  } & Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'ref'
  >;
  const DraggableButton = forwardRef<HTMLButtonElement, DraggableButtonProps>(
    function DraggableButton(
      {
        label,
        iconName,
        hideLabel = false,
        onRightClickCallback,
        hidden = false,
        className,
        ...props
      },
      ref,
    ) {
      const [isRightClicked, setIsRightClicked] = useState(false);
      const [isDropdownOpen, setIsDropdownOpen] = useState(false);

      const buttonElem = (
        <Button
          ref={ref}
          label={label}
          className={clsx(
            'w-max',
            'border border-[--color-accent]',
            hidden ? 'hidden' : '',
            className,
          )}
          variant={hideLabel ? 'flat' : 'primary'}
          icon={
            hideLabel && isRightClicked ? (
              <MaterialSymbol icon="delete" className="text-red-400" />
            ) : (
              <MaterialSymbol icon={iconName} />
            )
          }
          hideLabel={hideLabel}
          onMouseUp={(e) => {
            if (e.button == 2) onRightClickCallback?.();
          }}
          onContextMenu={
            hideLabel
              ? (e) => {
                  e.preventDefault();
                  setIsRightClicked(true);
                }
              : undefined
          }
          onMouseLeave={hideLabel ? () => setIsRightClicked(false) : undefined}
          {...props}
        />
      );
      return hideLabel ? (
        buttonElem
      ) : (
        <DropdownMenu.Root>
          <div className="flex space-x-4 items-center">
            {buttonElem}
            <DropdownMenu.Trigger>
              <Button
                label=""
                endIcon={
                  isDropdownOpen ? (
                    <MaterialSymbol icon="arrow_drop_up" />
                  ) : (
                    <MaterialSymbol icon="arrow_drop_down" />
                  )
                }
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
            </DropdownMenu.Trigger>
          </div>
          <DropdownMenu.Content sideOffset={12}>
            <div>Example explanation of draggable</div>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    },
  );

  const Draggable = (props: {
    id: string;
    label: string;
    iconName: string;
    hideLabel?: boolean;
    onRightClickCallback?: () => void;
    gridPos?: [number, number, number];
    hidden?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const draggableButtonProps = {
      label: props.label,
      iconName: props.iconName,
      className: props.className,
      hideLabel: props.hideLabel,
      onRightClickCallback: props.onRightClickCallback,
      hidden: props.hidden,
      // hidden: true,
    };
    if (props.gridPos) {
      console.log(draggableButtonProps);
    }
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: props.id,
      data: {
        draggableButtonProps: {
          ...draggableButtonProps,
          hideLabel: true,
          hidden: false,
        },
        gridPos: props.gridPos,
      },
    });

    return (
      <DraggableButton
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        {...draggableButtonProps}
      />
    );
  };

  interface DroppableCell extends Cell {
    type: 'droppable';
    component: React.ReactNode;
  }

  const noBorderCellStyle = {
    border: {
      left: { width: '0' },
      top: { width: '0' },
      right: { width: '0' },
      bottom: { width: '0' },
    },
  };
  type NoBorderCellStyle = typeof noBorderCellStyle;
  const rowIndexCellStyle = {
    border: {
      left: { width: '0' },
      top: { width: '0' },
      bottom: { width: '0' },
    },
  };
  type RowIndexCellStyle = typeof rowIndexCellStyle;
  interface RowIndexCell extends Cell {
    type: 'rowIndex';
    index: number;
    style: RowIndexCellStyle | NoBorderCellStyle;
  }

  const colIndexCellStyle = {
    border: {
      left: { width: '0' },
      top: { width: '0' },
      right: { width: '0' },
    },
  };
  type ColIndexCellStyle = typeof colIndexCellStyle;
  interface ColIndexCell extends Cell {
    type: 'colIndex';
    index: number;
    style: ColIndexCellStyle | NoBorderCellStyle;
  }

  const droppableCellTemplate: CellTemplate<DroppableCell> = {
    getCompatibleCell: (uncertainCell) => {
      return {
        ...uncertainCell,
        text: 'droppable',
        value: Number.NaN,
        component: uncertainCell.component ?? <></>,
      };
    },
    render: (cell, isInEditMode, onCellChanged) => {
      return cell.component;
    },
  };

  const rowIndexCellTemplate: CellTemplate<RowIndexCell> = {
    getCompatibleCell: (uncertainCell) => {
      const type: string = getCellProperty(uncertainCell, 'type', 'string');
      const index: number = getCellProperty(uncertainCell, 'index', 'number');
      const style: RowIndexCellStyle | NoBorderCellStyle = getCellProperty(
        uncertainCell,
        'style',
        'object',
      );
      return {
        ...uncertainCell,
        text: type,
        value: index,
        index,
        style: style,
      };
    },
    render: (cell, isInEditMode, onCellChanged) => <p>{cell.index}</p>,
  };

  const colIndexCellTemplate: CellTemplate<ColIndexCell> = {
    getCompatibleCell: (uncertainCell) => {
      const type: string = getCellProperty(uncertainCell, 'type', 'string');
      const index: number = getCellProperty(uncertainCell, 'index', 'number');
      const style: ColIndexCellStyle | NoBorderCellStyle = getCellProperty(
        uncertainCell,
        'style',
        'object',
      );
      return {
        ...uncertainCell,
        text: type,
        value: index,
        index,
        style: style,
      };
    },
    render: (cell, isInEditMode, onCellChanged) => <p>{cell.index}</p>,
  };

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState<number>();
  const [gridCellData, setGridCellData] = useState<DraggableButtonProps[][][]>(
    Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => [])),
  ); // represents the props of the draggable buttons currently in each grid cell
  const [activeObject, setActiveObject] = useState<string | null>(null);

  const getFirstRowCells = (): Array<ColIndexCell> => [
    { type: 'colIndex', index: -1, style: noBorderCellStyle },
    ...Array.from(
      { length: 8 },
      (_, i): ColIndexCell => ({
        type: 'colIndex',
        index: i,
        style: colIndexCellStyle,
      }),
    ),
  ];
  const getRowCells = (i: number): Array<DroppableCell | RowIndexCell> => [
    {
      type: 'rowIndex',
      index: i,
      style: rowIndexCellStyle,
    },
    ...Array.from(
      { length: 8 },
      (_, j): DroppableCell => ({
        type: 'droppable',
        component: (
          <Droppable
            id={`[${i}, ${j}]`}
            className="flex flex-col items-center w-full h-full overflow-auto"
          >
            {gridCellData[i][j].map((props, k) => (
              <>
                <div className="flex space-between items-center w-full p-1">
                  <span className="text-border">{k + 1}.</span>
                  <div className="flex flex-grow justify-center">
                    <Draggable
                      key={k}
                      id={`draggable-(${i}, ${j}, ${k})`}
                      // onClick={() => removeDraggableFromGrid(i, j, k)}
                      // onContextMenu={(e) => {
                      //   e.preventDefault();
                      //   removeDraggableButton(i, j, k);
                      // }}
                      {...props}
                      hideLabel={true}
                      gridPos={[i, j, k]}
                      onRightClickCallback={() => {
                        removeDraggableFromGrid(i, j, k);
                      }}
                    />
                  </div>
                </div>
                <Separator
                  key={`separator-(${i}, ${j}, ${k})`}
                  className="min-h-px w-full bg-border my-1"
                />
              </>
            ))}
          </Droppable>
        ),
      }),
    ),
  ];
  const rows: Row<DroppableCell | RowIndexCell | ColIndexCell>[] = [
    { rowId: -1, height: 20, cells: getFirstRowCells() },
    ...Array.from({ length: 8 }, (_, i) => ({
      rowId: `${i}`,
      height: gridSize ?? 0,
      cells: getRowCells(i),
    })),
  ];

  const cols: Column[] = [
    { columnId: '-1', width: 40 }, // minimum width of a column is 40px, setting lower has no effect
    ...Array.from({ length: 8 }, (_, i) => ({
      columnId: `${i}`,
      width: gridSize ?? 0,
    })),
  ];

  const setGridColWidth = () => {
    const containerWidth = gridContainerRef.current?.offsetWidth ?? 0;
    console.log(containerWidth);
    setGridSize(Math.max(100, (containerWidth - 40) / 8));
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.draggableButtonProps.label) {
      // console.log(event.active.id);
      // console.log(event.active.id.split('draggable-')[1]);
      // setActiveObject(event.active.id.split('draggable-')[1]);
      setActiveObject(event.active.data.current.draggableButtonProps.label);
    }
    // if (event.active.data?.current?.gridPos) {
    //   const [i, j, k] = event.active.data.current.gridPos as [
    //     number,
    //     number,
    //     number,
    //   ];
    //   hideDraggableFromGrid(i, j, k);
    // }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event.over?.id, typeof event.over?.id);
    if (
      event.over &&
      typeof event.over.id == 'string' &&
      typeof event.active.id == 'string'
    ) {
      const [i, j] = JSON.parse(event.over.id) as [number, number];
      const newGridCellData = [...gridCellData];
      console.log('event active data', event.active.data);
      const draggableButtonProps = event.active.data.current
        ?.draggableButtonProps ?? { label: 'unknown' };
      newGridCellData[i][j].push(draggableButtonProps);
      console.log(newGridCellData);
      setGridCellData(newGridCellData);
      setActiveObject(null);
      if (event.active.data?.current?.gridPos) {
        const [i, j, k] = event.active.data.current.gridPos as [
          number,
          number,
          number,
        ];
        removeDraggableFromGrid(i, j, k);
      }
    }
  };

  const removeDraggableFromGrid = (i: number, j: number, index: number) => {
    const newGridCellData = [...gridCellData];
    newGridCellData[i][j].splice(index, 1);
    setGridCellData(newGridCellData);
  };

  // const hideDraggableFromGrid = (i: number, j: number, index: number) => {
  //   const newGridCellData = [...gridCellData];
  //   newGridCellData[i][j][index].hidden = true;
  //   setGridCellData(newGridCellData);
  //   console.log(newGridCellData);
  //   console.log('hid draggable', i, j, index);
  // };

  useEffect(() => {
    setGridColWidth();

    if (!gridContainerRef.current) return;
    const gridContainer = gridContainerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === gridContainer) {
          setGridColWidth();
        }
      }
    });
    resizeObserver.observe(gridContainer);

    setGridCellData(initialData[0] as DraggableButtonProps[][][]);

    return () => {
      resizeObserver.unobserve(gridContainer);
    };
  }, [initialData]);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(event: DragOverEvent) => console.log(event)}
    >
      <DragOverlay>
        {/* {activeObject ? (
          <DraggableButton
            label={activeObject}
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        ) : null} */}
        {activeObject ? (
          <MaterialSymbol
            icon={labelToIconNameMap.get(activeObject) ?? ''}
            className="text-white"
          />
        ) : null}
      </DragOverlay>
      <PanelGroup
        direction="horizontal"
        className="w-full h-full flex-1 overflow-hidden"
      >
        <Panel className="flex flex-col gap-y-2 p-2" defaultSize={30}>
          <div className="flex flex-col gap-y-4 p-2">
            <Button label="Cancel" onClick={onCancel} />
            <Button
              label="Save"
              onClick={() => {
                onSave([gridCellData, initialData[1]]);
              }}
            />
            <Separator className="h-px bg-border my-4" />
            {Array.from(labelToIconNameMap.entries()).map(
              ([label, icon], i) => (
                <Draggable
                  key={i}
                  id={`draggable-${label}`}
                  label={label}
                  iconName={icon}
                />
              ),
            )}
          </div>
        </Panel>
        <ResizeHandle />
        <Panel className="p-4" style={{ overflow: 'auto' }}>
          <div
            className={clsx(
              'min-w-full w-max',
              gridSize == undefined && 'hidden',
            )}
            ref={gridContainerRef}
          >
            <ReactGrid
              rows={rows}
              columns={cols}
              customCellTemplates={{
                droppable: droppableCellTemplate,
                rowIndex: rowIndexCellTemplate,
                colIndex: colIndexCellTemplate,
              }}
              onFocusLocationChanging={() => false}
              onSelectionChanging={() => false}
            />
          </div>
        </Panel>
      </PanelGroup>
    </DndContext>
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
  value: [
    Array<Array<Array<Record<string, unknown>>>>,
    Array<[string, string]>,
  ];
  onChange: (
    value: [
      Array<Array<Array<Record<string, unknown>>>>,
      Array<[string, string]>,
    ],
  ) => void;
}) {
  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onSave = useCallback(
    (
      data: [
        Array<Array<Array<Record<string, unknown>>>>,
        Array<[string, string]>,
      ],
    ) => {
      onChange(data);
      onOpenChange(false);
    },
    [onChange, onOpenChange],
  );

  return (
    <Dialog
      title="Grid editor"
      content={
        <GridEditor initialData={value} onSave={onSave} onCancel={onCancel} />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
