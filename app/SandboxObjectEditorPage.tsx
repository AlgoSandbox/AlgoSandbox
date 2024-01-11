import { DirectoryExplorer } from '@components/box-environment-page';
import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { Button, Input, ResizeHandle } from '@components/ui';
import { DbSandboxObjectSaved } from '@utils/db';
import { useSavedObjectQuery, useSaveObjectMutation } from '@utils/db/objects';
import _ from 'lodash';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';

type SandboxObjectEditorPageProps = {
  object: DbSandboxObjectSaved;
  onCloned: (newObject: DbSandboxObjectSaved) => void;
  onSaved: (newObject: DbSandboxObjectSaved) => void;
};

export default function SandboxObjectEditorPage({
  object,
  onCloned,
  onSaved,
}: SandboxObjectEditorPageProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(
    'index.ts' in object.files ? 'index.ts' : null,
  );
  const isViewOnly = !object.editable;

  const { mutateAsync: saveObject } = useSaveObjectMutation();
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
    <form
      className="flex flex-col h-full"
      onSubmit={handleSubmit(async (values) => {
        const newObject = await saveObject({
          ...object,
          name: values.name,
          files: _.mapKeys(values.files, (_, key) => key.replaceAll('$', '.')),
        });
        console.log('SAVING');
        onSaved(newObject);
        reset(values);
      })}
    >
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
                type="button"
                variant="primary"
                onClick={async () => {
                  const newObject = await saveObject({
                    ...object,
                    key: undefined,
                    editable: true,
                    name: `${object.name} (copy)`,
                  });
                  onCloned(newObject);
                }}
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
          <div className="flex-1 flex flex-col h-full">
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
          </div>
        </Panel>
      </PanelGroup>
    </form>
  );
}
