import { ComponentTag } from '@algo-sandbox/core';
import MarkdownPreview from '@components/common/MarkdownPreview';
import AlgoSandboxEditor from '@components/editor/AlgoSandboxEditor';
import { MarkdownEditorMode } from '@components/editor/InitializedMDXEditor';
import MarkdownEditor from '@components/editor/MarkdownEditor';
import { Button, Chip, Input, MaterialSymbol, TagInput } from '@components/ui';
import Heading from '@components/ui/Heading';
import ResizeHandle from '@components/ui/ResizeHandle';
import { DbSandboxObject, DbSandboxObjectSaved } from '@utils/db';
import {
  useDeleteObjectMutation,
  useSavedObjectQuery,
  useSaveObjectMutation,
} from '@utils/db/objects';
import evalSavedObject from '@utils/eval/evalSavedObject';
import parseSandboxObjectConfig from '@utils/parseSandboxComponentConfig';
import stringifyComponentConfigToTs from '@utils/stringifyComponentConfigToTs';
import {
  exportObjectToRelativeUrl,
  getSavedComponentRelativeUrl,
} from '@utils/url-object/urlObject';
import clsx from 'clsx';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { toast } from 'sonner';

type SandboxObjectEditorProps =
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
}: SandboxObjectEditorProps) {
  const selectedFilePath = 'index.ts' in object.files ? 'index.ts' : null;

  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [markdownEditorMode, setMarkdownEditorMode] =
    useState<MarkdownEditorMode>('rich-text');

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
    setValue,
    reset,
    watch,
  } = useForm<{
    name: string;
    files: Record<string, string>;
  }>({
    defaultValues: {
      name: object.name,
      files: _.mapKeys(files, (_, key) => key.replaceAll('.', '$')),
    },
  });

  const markdownContents = watch('files.index$md');
  const configContents = watch('files.config$ts');

  const currentConfig = useMemo(() => {
    return parseSandboxObjectConfig(configContents);
  }, [configContents]);
  const tags = useMemo(() => currentConfig.tags, [currentConfig]);

  const handleCopyImportLink = useCallback(() => {
    const relativeUrl = exportObjectToRelativeUrl(object);
    navigator.clipboard.writeText(`${window.location.origin}${relativeUrl}`);
    toast.success('Import link copied to clipboard');
  }, [object]);

  const handleDelete = async () => {
    if (isViewOnly) {
      return;
    }
    await deleteObject(object as DbSandboxObjectSaved);
    toast.success('Component deleted');
  };

  return (
    <form
      className="flex flex-col w-full h-full"
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
          <div className="overflow-y-auto w-full h-full">
            <div className="flex flex-col w-full overflow-x-auto">
              <div className="flex justify-between px-4 py-2 mt-2 items-center">
                <Heading className="capitalize" variant="h3">
                  {object.type}
                </Heading>
              </div>
              {mode === 'edit' && !isViewOnly && (
                <div className="px-4 py-2 flex gap-2 items-end">
                  <Input
                    containerClassName="flex-1"
                    label="Name"
                    {...register('name', { required: true })}
                  />
                  <Button
                    label="Save"
                    hideLabel={true}
                    type="submit"
                    variant="primary"
                    icon={<MaterialSymbol icon="save" />}
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
                    label={
                      isDirty
                        ? 'Save first to copy import link'
                        : 'Copy import link'
                    }
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
                        const relativeUrl =
                          getSavedComponentRelativeUrl(object);
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
              <div className="border-t p-4 flex flex-col gap-2">
                <Heading variant="h4">Tags</Heading>
                {isViewOnly && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                )}
                {!isViewOnly && (
                  <TagInput
                    label="Tags"
                    hideLabel
                    value={tags}
                    onChange={(tags) => {
                      setValue(
                        'files.config$ts',
                        stringifyComponentConfigToTs({
                          tags: tags as Array<ComponentTag>,
                        }),
                        {
                          shouldDirty: true,
                        },
                      );
                    }}
                  />
                )}
              </div>
              <SandboxObjectEditorAdditionalMetadata object={object} />
              <div className="flex flex-col border-t pb-4">
                <div className="px-4 py-2 flex items-center justify-between">
                  {!isViewOnly && (
                    <>
                      <Heading variant="h4">Writeup</Heading>
                      <div className="flex gap-2">
                        {!isEditingMarkdown && (
                          <Button
                            label="Edit"
                            hideLabel
                            icon={<MaterialSymbol icon="edit" />}
                            variant="filled"
                            onClick={() => {
                              setIsEditingMarkdown(true);
                            }}
                          />
                        )}
                        {isEditingMarkdown && (
                          <>
                            <Button
                              label="Done"
                              hideLabel
                              icon={<MaterialSymbol icon="done" />}
                              variant="filled"
                              onClick={() => {
                                setIsEditingMarkdown(false);
                              }}
                            />
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {!isEditingMarkdown && markdownContents && (
                  <div className="px-4">
                    <MarkdownPreview markdown={markdownContents} />
                  </div>
                )}
                {isEditingMarkdown && markdownContents && (
                  <Controller
                    control={control}
                    name={'files.index$md'}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <MarkdownEditor
                        markdown={value}
                        mode={markdownEditorMode}
                        onModeChange={setMarkdownEditorMode}
                        onChange={(value) => {
                          onChange({
                            target: { value: value ?? '' },
                          });
                        }}
                      />
                    )}
                  />
                )}
              </div>
            </div>
          </div>
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

function PseudocodePreview({ pseudocode }: { pseudocode: string }) {
  return (
    <div className="flex gap-4 overflow-x-hidden text-xs">
      <div className="flex flex-col transition-colors text-on-surface/30 group-hover:text-on-surface/80 items-end">
        {Array.from({ length: pseudocode.split('\n').length }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="flex flex-col overflow-x-auto">
        {pseudocode.split('\n').map((line, lineIndex) => {
          const lineNumber = lineIndex + 1;

          return (
            <code className={clsx('transition-colors')} key={lineNumber}>
              {line}
              {line.length === 0 && ' '}
            </code>
          );
        })}
      </pre>
    </div>
  );
}

function SandboxObjectEditorAdditionalMetadata({
  object,
}: {
  object: DbSandboxObject;
}) {
  const pseudocode = useMemo(() => {
    if (object.type !== 'algorithm') {
      return null;
    }

    const algorithmEvaluation = evalSavedObject(
      object as DbSandboxObject<'algorithm'>,
    );

    return algorithmEvaluation.map((algorithm) => {
      const instance =
        'parameters' in algorithm ? algorithm.create() : algorithm;

      return instance.pseudocode;
    });
  }, [object]);

  if (object.type !== 'algorithm') {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-4 p-4 border-t">
      <div className="flex flex-col">
        <Heading variant="h4">Pseudocode</Heading>
      </div>
      {
        pseudocode!
          .mapLeft((errors) => {
            return (
              <div className="text-danger bg-surface-high rounded p-2 text-xs">
                {errors.map((error, index) => (
                  <div key={index}>{error.message}</div>
                ))}
              </div>
            );
          })
          .mapRight((pseudocode) => (
            <div className="overflow-x-auto bg-surface-high rounded">
              <PseudocodePreview pseudocode={pseudocode} />
            </div>
          )).value
      }
    </div>
  );
}
