import { DirectoryExplorer } from '@components/box-environment-page';
import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { Button, Input, ResizeHandle } from '@components/ui';
import { DbSandboxObjectSaved } from '@utils/db';
import { useSavedObjectQuery } from '@utils/db/objects';
import _ from 'lodash';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';

type SandboxObjectEditorPageProps = {
  object: DbSandboxObjectSaved;
  onClone: () => void;
  onSave: (object: DbSandboxObjectSaved) => void;
};

export default function SandboxObjectEditorPage({
  object,
  onClone,
  onSave,
}: SandboxObjectEditorPageProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(
    'index.ts' in object.files ? 'index.ts' : null,
  );

  const isViewOnly = !object.editable;

  const { data: savedObject } = useSavedObjectQuery(object.key);

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

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup className="flex-1" direction="horizontal">
        <Panel key="explorer" defaultSize={20}>
          {!isViewOnly && (
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
            </div>
          )}
          {isViewOnly && (
            <div className="flex items-center justify-between py-2 px-4">
              <h1 className="font-medium text-lg">{object.name}</h1>
              <Button
                label="Clone to edit"
                type="submit"
                variant="primary"
                onClick={onClone}
              />
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
          <form
            className="flex-1 flex flex-col h-full"
            onSubmit={handleSubmit((values) => {
              onSave({
                ...object,
                name: values.name,
                files: _.mapKeys(values.files, (_, key) =>
                  key.replaceAll('$', '.'),
                ),
              });
              reset(values);
            })}
          >
            {selectedFilePath && (
              <div className="flex-1">
                <Controller
                  key={selectedFilePath}
                  control={control}
                  name={`files.${selectedFilePath.replaceAll('.', '$')}`}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <AlgoSandboxEditor
                      files={files}
                      path={`file:///${selectedFilePath}`}
                      value={value}
                      onChange={(value) => {
                        onChange({
                          target: { value: value ?? '' },
                        });
                      }}
                    />
                  )}
                />
              </div>
            )}
          </form>
        </Panel>
      </PanelGroup>
    </div>
  );
}
