import { DirectoryExplorer } from '@components/box-environment-page';
import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { Button, Input, MaterialSymbol } from '@components/ui';
import Heading from '@components/ui/Heading';
import ResizeHandle from '@components/ui/ResizeHandle';
import { DbSandboxObject, DbSandboxObjectSaved } from '@utils/db';
import {
  useDeleteObjectMutation,
  useSavedObjectQuery,
  useSaveObjectMutation,
} from '@utils/db/objects';
import {
  exportObjectToRelativeUrl,
  getSavedComponentRelativeUrl,
} from '@utils/url-object/urlObject';
import _ from 'lodash';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { toast } from 'sonner';

type SandboxObjectEditorPageProps =
  | {
      object: DbSandboxObjectSaved;
      onCloned: (newObject: DbSandboxObjectSaved) => void;
      onSave: (newObject: DbSandboxObjectSaved) => void;
      mode: 'edit';
    }
  | {
      object: DbSandboxObject;
      mode: 'import';
      onSave: (newObject: DbSandboxObject) => void;
      onCloned?: never;
    };

export default function SandboxObjectEditorPage({
  object,
  onCloned,
  onSave,
  mode,
}: SandboxObjectEditorPageProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(
    'index.ts' in object.files ? 'index.ts' : null,
  );
  const isViewOnly = !object.editable;

  const { mutateAsync: saveObject } = useSaveObjectMutation();
  const { mutateAsync: deleteObject } = useDeleteObjectMutation();
  const { data: savedObject } = useSavedObjectQuery(object.key ?? null);

  const files = savedObject?.files ?? object.files;

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<{
    name: string;
    files: Record<string, string>;
  }>({
    defaultValues: {
      name: object.name,
      files: _.mapKeys(files, (_, key) => key.replaceAll('.', '$')),
    },
  });

  const handleCopyImportLink = () => {
    const relativeUrl = exportObjectToRelativeUrl(object);
    navigator.clipboard.writeText(`${window.location.origin}${relativeUrl}`);
    toast.success('Import link copied to clipboard');
  };

  const handleDelete = async () => {
    if (isViewOnly) {
      return;
    }
    await deleteObject(object as DbSandboxObjectSaved);
    toast.success('Component deleted');
  };

  return (
    <form
      className="flex flex-col h-full"
      onSubmit={handleSubmit(async (values) => {
        const newObject = await saveObject({
          ...object,
          name: values.name,
          files: _.mapKeys(values.files, (_, key) => key.replaceAll('$', '.')),
        });
        onSave(newObject);
        reset(values);
      })}
    >
      <PanelGroup className="flex-1" direction="horizontal">
        <Panel key="explorer" defaultSize={30}>
          <Heading className="px-4 py-2 mt-2 capitalize" variant="h3">
            {object.type}
          </Heading>
          {mode === 'edit' && !isViewOnly && (
            <div className="px-4 py-2 flex gap-2 items-end">
              <Input
                containerClassName="flex-1"
                label="Name"
                {...register('name', { required: true })}
              />
              <Button
                label="Save"
                type="submit"
                variant="primary"
                disabled={isViewOnly || !isDirty}
              />
              <Button
                label="Delete"
                hideLabel={true}
                icon={<MaterialSymbol icon="delete" />}
                type="button"
                variant="filled"
                disabled={isViewOnly}
                onClick={handleDelete}
              />
              <Button
                icon={<MaterialSymbol icon="link" />}
                label="Copy import link"
                hideLabel={true}
                type="button"
                onClick={handleCopyImportLink}
                variant="primary"
                disabled={isDirty}
              />
            </div>
          )}
          {mode === 'import' && (
            <div className="px-4 py-2 flex gap-2 items-end">
              <Input
                containerClassName="flex-1"
                label="Name"
                {...register('name', { required: true })}
              />
              <Button label="Save" type="submit" variant="primary" />
            </div>
          )}
          {mode === 'edit' && isViewOnly && (
            <div className="flex items-center justify-between py-2 px-4">
              <h1 className="font-medium text-lg">{object.name}</h1>
              <div className="flex gap-2">
                <Button
                  label="Clone to edit"
                  type="button"
                  variant="filled"
                  onClick={async () => {
                    const newObject = await saveObject({
                      ...object,
                      key: undefined,
                      editable: true,
                      name: `${object.name} (copy)`,
                    });
                    onCloned?.(newObject);
                  }}
                />
                <Button
                  icon={<MaterialSymbol icon="link" />}
                  label="Copy link"
                  hideLabel={true}
                  type="button"
                  onClick={() => {
                    const relativeUrl = getSavedComponentRelativeUrl(object);
                    navigator.clipboard.writeText(
                      `${window.location.origin}${relativeUrl}`,
                    );
                    toast.success('Link copied to clipboard');
                  }}
                  variant="primary"
                  disabled={isDirty}
                />
              </div>
            </div>
          )}
          <DirectoryExplorer
            activePath={selectedFilePath}
            files={files}
            onFileClick={(file) => {
              setSelectedFilePath(file.path);
            }}
          />
        </Panel>
        <ResizeHandle />
        <Panel key="editor">
          {selectedFilePath && (
            <Controller
              key={selectedFilePath}
              control={control}
              name={`files.${selectedFilePath.replaceAll('.', '$')}`}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <AlgoSandboxEditor
                  files={files}
                  path={`file:///${selectedFilePath}`}
                  readOnly={isViewOnly}
                  value={value}
                  onChange={(value) => {
                    onChange({
                      target: { value: value ?? '' },
                    });
                  }}
                />
              )}
            />
          )}
        </Panel>
      </PanelGroup>
    </form>
  );
}
