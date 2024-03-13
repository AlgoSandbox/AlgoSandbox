import Dialog from '@components/ui/Dialog';
import { useTheme } from 'next-themes';
import React from 'react';

import StyledSpreadsheet from './StyledSpreadsheet';

function SpreadsheetEditor() {
  const data = [
    [{ value: 'Vanilla' }, { value: 'Chocolate' }],
    [{ value: 'Strawberry' }, { value: 'Cookies' }],
  ];

  const { resolvedTheme } = useTheme();

  return (
    <div className="w-full h-full flex flex-col flex-1">
      <StyledSpreadsheet data={data} darkMode={resolvedTheme === 'dark'} />
    </div>
  );
}

export default function SpreadsheetEditorDialog({
  open,
  onOpenChange, // value,
} // onChange,
: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  // const onCancel = useCallback(() => {
  //   onOpenChange(false);
  // }, [onOpenChange]);

  return (
    <Dialog
      title="Spreadsheet editor"
      content={
        <SpreadsheetEditor
        // initialGraph={initialGraph}
        // onGraphSave={onGraphSave}
        // onCancel={onCancel}
        />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
