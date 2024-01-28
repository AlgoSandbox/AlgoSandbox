import { DirectoryExplorer } from '@components/box-environment-page';
import { useBoxContext } from '@components/box-page';
import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { Button, ResizeHandle } from '@components/ui';
import _ from 'lodash';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';

export default function BoxEnvironmentEditorPage() {
  const { value: boxEnvironment, setValue: setBoxEnvironment } =
    useBoxContext('boxEnvironment');

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<Record<string, string>>({
    defaultValues: _.mapKeys(boxEnvironment, (_, key) =>
      key.replaceAll('.', '$'),
    ),
  });

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup className="flex-1" direction="horizontal">
        <Panel key="explorer" defaultSize={20}>
          <DirectoryExplorer
            activePath={selectedFilePath}
            files={boxEnvironment}
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
              setBoxEnvironment(
                _.mapKeys(values, (_, key) => key.replaceAll('$', '.')),
              );
              reset(values);
            })}
          >
            <div className="flex justify-end">
              <Button
                label="Save (disabled for now, buggy)"
                type="submit"
                variant="primary"
                disabled={true}
                // disabled={!isDirty}
              />
            </div>
            {selectedFilePath && (
              <div className="flex-1">
                <Controller
                  key={selectedFilePath}
                  control={control}
                  name={selectedFilePath.replaceAll('.', '$')}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <AlgoSandboxEditor
                      files={boxEnvironment}
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
