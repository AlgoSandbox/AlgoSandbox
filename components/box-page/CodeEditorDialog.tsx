import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { Button } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';

function CodeEditor({
  initialCode,
  onCodeSave,
  onCancel,
}: {
  initialCode: string;
  onCodeSave: (code: string) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const onSaveClick = useCallback(() => {
    onCodeSave(code);
  }, [code, onCodeSave]);

  return (
    <div className="w-full h-full flex flex-col flex-1">
      <div className="flex justify-between gap-2 mt-2">
        <div className="flex gap-2">
          <Button label="Cancel" onClick={onCancel} />
          <Button
            label="Save"
            variant="primary"
            disabled={code === initialCode}
            onClick={onSaveClick}
          />
        </div>
      </div>
      <AlgoSandboxEditor
        value={code}
        onChange={(value) => {
          if (value !== undefined) {
            setCode(value);
          }
        }}
        files={{}}
        path="index.ts"
      />
    </div>
  );
}

export default function CodeEditorDialog({
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
  const onCodeSave = useCallback(
    (code: string) => {
      onChange(code);
      onOpenChange(false);
    },
    [onChange, onOpenChange],
  );

  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog
      title="Code editor"
      content={
        <CodeEditor
          initialCode={value}
          onCodeSave={onCodeSave}
          onCancel={onCancel}
        />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
