'use client';

import { ComponentTag } from '@algo-sandbox/core';
import { Button, Input, TagInput } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import { CatalogOption } from '@constants/catalog';
import { DbBoxSaved } from '@utils/db';
import getSandboxObjectConfig from '@utils/getSandboxObjectConfig';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useBoxContext } from './box-context';

interface SaveBoxDialogProps {
  selectedOption: CatalogOption<DbBoxSaved> | undefined;
  saveBoxDialogOpen: boolean;
  setSaveBoxDialogOpen: (open: boolean) => void;
  handleSaveClick: () => void;
}

export function SaveBoxDialog({
  selectedOption,
  saveBoxDialogOpen,
  setSaveBoxDialogOpen,
  handleSaveClick,
}: SaveBoxDialogProps) {
  const { isBoxCustom, save: saveBox, isBoxDirty } = useBoxContext();

  const selectedOptionTags = useMemo(() => {
    if (selectedOption === undefined) {
      return [];
    }

    return getSandboxObjectConfig(selectedOption.value).tags;
  }, [selectedOption]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<{
    name: string;
    tags: Array<ComponentTag>;
  }>({
    defaultValues: {
      name: selectedOption?.label ?? '',
      tags: selectedOptionTags,
    },
  });

  useEffect(() => {
    reset({
      name: selectedOption?.label ?? '',
      tags: selectedOptionTags,
    });
  }, [selectedOption, reset, selectedOptionTags]);

  const handleSaveBox: typeof saveBox = async (options) => {
    setSaveBoxDialogOpen(false);
    await saveBox(options);
    if (options.asNew) {
      toast.success(`Saved as "${options.name}"`);
    } else {
      toast.success(`Saved changes to ${options.name}`);
    }
  };
  return (
    <Dialog
      title="Save box"
      content={
        <form
          onSubmit={handleSubmit((data) => {
            handleSaveBox({ ...data, asNew: !isBoxCustom });
          })}
        >
          <Input
            label="Name"
            containerClassName="flex-1 mb-2"
            {...register('name')}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                label="Tags (enter to add)"
                value={field.value}
                onChange={(tags) => {
                  field.onChange({
                    target: {
                      value: tags,
                    },
                  });
                }}
              />
            )}
          />
          <div className="flex gap-2 mt-4 justify-end">
            {!isBoxCustom && (
              <Button type="submit" variant="primary" label="Save as new" />
            )}
            {isBoxCustom && (
              <>
                <Button
                  type="button"
                  variant="filled"
                  label="Save as new"
                  onClick={() => {
                    handleSaveBox({ ...getValues(), asNew: true });
                  }}
                />
                <Button
                  label="Save"
                  variant="primary"
                  type="submit"
                  disabled={!isBoxDirty && !isDirty}
                  onClick={handleSaveClick}
                />
              </>
            )}
          </div>
        </form>
      }
      open={saveBoxDialogOpen}
      onOpenChange={setSaveBoxDialogOpen}
    />
  );
}
