import { SandboxParameter, SandboxParameters } from '@algo-sandbox/core';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Button, Input, MaterialSymbol } from '../ui';
import CodeEditorDialog from './CodeEditorDialog';
import GraphEditorDialog from './GraphEditor';
import GridEditorDialog from './GridEditor';
import TabularDatasetEditorDialog from './TabularDatasetEditor';

type ParameterControlProps<P extends SandboxParameter> = {
  fieldName: string;
  parameter: P;
  onSave: () => void;
};

function CodeEditorDialogControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Edit code"
        type="button"
        variant="filled"
        icon={<MaterialSymbol icon="edit" />}
        onClick={() => setOpen(true)}
      />
      <CodeEditorDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

function GraphEditorDialogControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Edit graph"
        type="button"
        variant="filled"
        icon={<MaterialSymbol icon="edit" />}
        onClick={() => setOpen(true)}
      />
      <GraphEditorDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

function GridEditorDialogControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Edit grid"
        type="button"
        variant="filled"
        icon={<MaterialSymbol icon="edit" />}
        onClick={() => setOpen(true)}
      />
      <GridEditorDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

function SpreadsheetEditorDialogControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        label="Edit spreadsheet"
        type="button"
        variant="filled"
        icon={<MaterialSymbol icon="edit" />}
        onClick={() => setOpen(true)}
      />
      <TabularDatasetEditorDialog
        open={open}
        onOpenChange={setOpen}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

function ParameterControl<P extends SandboxParameter>({
  fieldName,
  parameter,
  onSave,
}: ParameterControlProps<P>) {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const watchField = watch(fieldName);

  const input = (() => {
    switch (parameter.type) {
      case 'integer':
        return (
          <Input
            label={parameter.name}
            error={errors[fieldName]?.message?.toString()}
            {...register(fieldName, {
              valueAsNumber: true,
              validate: (value: number) => {
                if (value !== Math.floor(value)) {
                  return 'Value must be an integer';
                }

                return parameter.validate?.(value) ?? true;
              },
            })}
            type="number"
          />
        );
      case 'callback':
        return (
          <Input
            label={parameter.name}
            error={errors[fieldName]?.message?.toString()}
            {...register(fieldName, { validate: parameter.validate })}
            disabled
          />
        );
      case 'float':
        return (
          <Input
            label={parameter.name}
            error={errors[fieldName]?.message?.toString()}
            {...register(fieldName, {
              valueAsNumber: true,
              validate: parameter.validate,
            })}
            disabled
          />
        );
      case 'string':
        return (
          <Input
            label={parameter.name}
            error={errors[fieldName]?.message?.toString()}
            {...register(fieldName, { validate: parameter.validate })}
          />
        );
      case 'color':
        return (
          <Input
            label={parameter.name}
            error={errors[fieldName]?.message?.toString()}
            {...register(fieldName, { validate: parameter.validate })}
          />
        );
      case 'graph':
        return (
          <Controller
            control={control}
            name={fieldName}
            render={({ field: { onChange, value } }) => (
              <GraphEditorDialogControl
                value={value}
                onChange={(value) => {
                  onChange({
                    target: {
                      value,
                    },
                  });
                  onSave();
                }}
              />
            )}
          />
        );
      case 'grid':
        return (
          <Controller
            control={control}
            name={fieldName}
            render={({ field: { onChange, value } }) => (
              <GridEditorDialogControl
                value={value}
                onChange={(value) => {
                  onChange({
                    target: {
                      value,
                    },
                  });
                  onSave();
                }}
              />
            )}
          />
        );
      case 'spreadsheet':
        return (
          <Controller
            control={control}
            name={fieldName}
            render={({ field: { onChange, value } }) => (
              <SpreadsheetEditorDialogControl
                value={value}
                onChange={(value) => {
                  onChange({
                    target: {
                      value,
                    },
                  });
                  onSave();
                }}
              />
            )}
          />
        );
      case 'code':
        return (
          <Controller
            control={control}
            name={fieldName}
            render={({ field: { onChange, value } }) => (
              <CodeEditorDialogControl
                value={value}
                onChange={(value) => {
                  onChange({
                    target: {
                      value,
                    },
                  });
                  onSave();
                }}
              />
            )}
          />
        );
      default:
        parameter.type satisfies never;
    }
  })();

  return (
    <div className="flex gap-2 items-end">
      {input}
      <Button
        label="Reset to default"
        hideLabel
        type="button"
        icon={<MaterialSymbol icon="settings_backup_restore" />}
        disabled={watchField === parameter.defaultValue}
        onClick={() => {
          setValue(fieldName, parameter.defaultValue, {
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
      />
    </div>
  );
}

export type ParameterControlsProps<P extends SandboxParameters> = {
  parameters: P;
  onSave: () => void;
  showCustomize?: boolean;
};

export default function ParameterControls<P extends SandboxParameters>({
  parameters,
  onSave,
  showCustomize = true,
}: ParameterControlsProps<P>) {
  const {
    formState: { isDirty },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-2 items-start">
      {Object.entries(parameters).map(([field, parameter]) => (
        <ParameterControl
          key={field}
          fieldName={field}
          parameter={parameter}
          onSave={onSave}
        />
      ))}
      {showCustomize && (
        <Button
          label="Customize"
          type="submit"
          variant="primary"
          disabled={!isDirty}
        />
      )}
    </div>
  );
}
