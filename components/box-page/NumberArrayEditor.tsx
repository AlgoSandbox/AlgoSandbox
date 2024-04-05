import { Button, Input } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import Heading, { HeadingContent } from '@components/ui/Heading';
import { isEqual } from 'lodash';
import random from 'random';
import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';

function NumberArrayEditor({
  onCancel,
  onSave,
  initialData,
}: {
  onCancel: () => void;
  initialData: Array<number>;
  onSave: (data: Array<number>) => void;
}) {
  const [data, setData] = useState(initialData);

  const { control, register, handleSubmit, setValue } = useForm<{
    minValue: number;
    maxValue: number;
    length: number;
    seed: string;
    manualInput: string;
  }>({
    defaultValues: {
      minValue: 0,
      maxValue: 100,
      length: 10,
      seed: '',
      manualInput: data.join(', '),
    },
    reValidateMode: 'onBlur',
  });

  const customArrayString = useWatch({ control, name: 'manualInput' });

  const parsedArray = useMemo(() => {
    if (customArrayString === '') {
      return [];
    }

    const array = customArrayString.split(',').map((x) => parseFloat(x.trim()));

    if (array.some((x) => isNaN(x))) {
      return null;
    }

    return array;
  }, [customArrayString]);

  useEffect(() => {
    if (parsedArray === null) {
      return;
    }

    setData(parsedArray);
  }, [customArrayString, parsedArray]);

  const isDirty = useMemo(
    () => !isEqual(data, initialData),
    [data, initialData],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-start">
        <Heading variant="h4">Generate random array</Heading>
        <HeadingContent>
          <form
            // className="contents"
            onSubmit={handleSubmit(({ seed, length, minValue, maxValue }) => {
              if (seed !== '') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                random.use(seed as any);
              } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                random.use(Math.random as any);
              }
              const generatedArray = Array.from({ length }, () =>
                random.int(minValue, maxValue),
              );
              setData(generatedArray);
              setValue('manualInput', generatedArray.join(', '));
            })}
          >
            <Input
              label="Min value"
              type="number"
              {...register('minValue', { valueAsNumber: true })}
            />
            <Input
              label="Max value"
              type="number"
              {...register('maxValue', { valueAsNumber: true })}
            />
            <Input
              label="Length"
              type="number"
              {...register('length', { valueAsNumber: true })}
            />
            <Input label="Seed" {...register('seed')} />
            <Button label="Generate" variant="filled" type="submit" />
          </form>
        </HeadingContent>
      </div>
      <hr />
      <div className="flex flex-col gap-2">
        <Heading variant="h4">Manual input</Heading>
        <Input
          label="Manual array input"
          hideLabel
          {...register('manualInput')}
          error={
            parsedArray === null
              ? 'Invalid array format. Use comma-separated numbers (e.g. 1,4,5)'
              : undefined
          }
        />
      </div>
      <hr />
      <div className="flex flex-col gap-1">
        <Heading variant="h4">Output array</Heading>
        <HeadingContent>
          <code className="text-accent">{JSON.stringify(data)}</code>
        </HeadingContent>
      </div>
      <div className="flex gap-2">
        <Button label="Cancel" onClick={onCancel} />
        <Button
          label="Save"
          variant="primary"
          onClick={() => onSave(data)}
          disabled={!isDirty}
        />
      </div>
    </div>
  );
}

export default function NumberArrayEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Array<number>;
  onChange: (value: Array<number>) => void;
}) {
  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onSave = useCallback(
    (data: Array<number>) => {
      onChange(data);
      onOpenChange(false);
    },
    [onChange, onOpenChange],
  );

  return (
    <Dialog
      title="Number array editor"
      content={
        <NumberArrayEditor
          initialData={value}
          onSave={onSave}
          onCancel={onCancel}
        />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
