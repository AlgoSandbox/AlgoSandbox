import { SandboxParameter, SandboxParameters } from '@algo-sandbox/core';
import { useFormContext } from 'react-hook-form';

import { Button, Input, MaterialSymbol } from '../ui';

type ParameterControlProps<P extends SandboxParameter> = {
  fieldName: string;
  parameter: P;
};

function ParameterControl<P extends SandboxParameter>({
  fieldName,
  parameter,
}: ParameterControlProps<P>) {
  const {
    register,
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
};

export default function ParameterControls<P extends SandboxParameters>({
  parameters,
}: ParameterControlsProps<P>) {
  const {
    formState: { isDirty },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-2 items-start">
      {Object.entries(parameters).map(([field, parameter]) => (
        <ParameterControl key={field} fieldName={field} parameter={parameter} />
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
