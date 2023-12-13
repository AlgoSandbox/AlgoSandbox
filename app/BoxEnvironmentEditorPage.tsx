import { DirectoryExplorer } from '@components/box-environment-page';
import { useBoxContext } from '@components/box-page';
import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { Button, MaterialSymbol, ResizeHandle } from '@components/ui';
import { BoxExplorerFile } from '@typings/directory';
import _ from 'lodash';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';

export default function BoxEnvironmentEditorPage() {
  const setMode = useBoxContext('mode.setValue');
  const { value: boxEnvironment, setValue: setBoxEnvironment } =
    useBoxContext('boxEnvironment');

  const [selectedFile, setSelectedFile] = useState<BoxExplorerFile | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<Record<string, string>>({
    defaultValues: _.mapKeys(boxEnvironment, (_, key) =>
      key.replaceAll('.', '$'),
    ),
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-start items-center px-4 border-b py-2 border-slate-300 gap-8">
        <div className="flex flex-row items-end gap-2">
          <Button
            icon={<MaterialSymbol icon="arrow_back" />}
            label="Back to view"
            onClick={() => {
              setMode('view');
            }}
          />
        </div>
      </header>
      <PanelGroup className="flex-1" direction="horizontal">
        <Panel key="explorer" defaultSize={20}>
          <DirectoryExplorer
            activeFile={selectedFile}
            files={boxEnvironment}
            onFileClick={setSelectedFile}
          />
        </Panel>
        <ResizeHandle />
        <Panel key="editor">
          <form
            className="flex-1 flex flex-col h-full"
            onSubmit={handleSubmit((values) => {
              setBoxEnvironment(
                _.mapKeys(values, (_, key) => key.replaceAll('$', '.')),
              );
              reset(values);
            })}
          >
            <div className="flex justify-end">
              <Button
                label="Save"
                type="submit"
                variant="primary"
                disabled={!isDirty}
              />
            </div>
            {selectedFile && (
              <div className="flex-1">
                <Controller
                  key={selectedFile.path}
                  control={control}
                  name={selectedFile.path.replaceAll('.', '$')}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <AlgoSandboxEditor
                      files={boxEnvironment}
                      path={`file:///${selectedFile.path}`}
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
