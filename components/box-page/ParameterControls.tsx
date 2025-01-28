import { SandboxParameters } from '@algo-sandbox/core';
import { useFormContext } from 'react-hook-form';

import { Button } from '../ui';
import ParameterControl from './ParameterControl';

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
