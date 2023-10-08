import { SandboxParameter, SandboxParameters } from '@/lib/algo-sandbox/core';
import { useFormContext } from 'react-hook-form';
import Input from './Input';
import { Button, MaterialSymbol, Tooltip } from '.';

type ParameterControlProps<P extends SandboxParameter> = {
  fieldName: string;
  parameter: P;
};

function ParameterControl<P extends SandboxParameter>({
  fieldName,
  parameter,
}: ParameterControlProps<P>) {
  const { register, setValue, watch } = useFormContext();
  const watchField = watch(fieldName);

  const input = (() => {
    switch (parameter.type) {
      case 'integer':
        return (
          <Input
            label={parameter.name}
            {...register(fieldName, { valueAsNumber: true })}
            type="number"
          />
        );

      case 'callback':
        return (
          <Input label={parameter.name} {...register(fieldName)} disabled />
        );
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
};

export default function ParameterControls<P extends SandboxParameters>({
  parameters,
}: ParameterControlsProps<P>) {
  const {
    formState: { isDirty },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-2 items-start">
      {Object.entries(parameters).map(([fieldName, parameter]) => (
        <ParameterControl
          key={fieldName}
          fieldName={fieldName}
          parameter={parameter}
        />
      ))}
      <Button
        label="Customize"
        type="submit"
        variant="primary"
        disabled={!isDirty}
      />
    </div>
  );
}
