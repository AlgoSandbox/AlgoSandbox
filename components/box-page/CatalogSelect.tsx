import { SandboxObjectType } from '@algo-sandbox/components';
import { getDefaultParameters, SandboxParameters } from '@algo-sandbox/core';
import { VisualizationRenderer } from '@algo-sandbox/react-components';
import MarkdownPreview from '@components/common/MarkdownPreview';
import {
  Button,
  Chip,
  FormLabel,
  Input,
  isSelectGroup,
  MaterialSymbol,
  Popover,
  Tooltip,
} from '@components/ui';
import { ButtonProps } from '@components/ui/Button';
import { CatalogOption, CatalogOptions } from '@constants/catalog';
import { DbSandboxObjectSaved } from '@utils/db';
import { useDeleteObjectMutation } from '@utils/db/objects';
import evalSavedObject from '@utils/eval/evalSavedObject';
import getSandboxObjectConfig from '@utils/getSandboxObjectConfig';
import getSandboxObjectWriteup from '@utils/getSandboxObjectWriteup';
import { useBreakpoint } from '@utils/useBreakpoint';
import usePreviewVisualization from '@utils/usePreviewVisualization';
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ParameterControls } from '.';

export type CatalogSelectProps<
  T extends SandboxObjectType,
  O extends CatalogOption<DbSandboxObjectSaved<T>> = CatalogOption<
    DbSandboxObjectSaved<T>
  >,
> = {
  className?: string;
  containerClassName?: string;
  options: CatalogOptions<DbSandboxObjectSaved<T>>;
  placeholder?: string;
  value?: O;
  onChange?: (value: O | null, parameters: SandboxParameters | null) => void;
  label: string;
  hideLabel?: boolean;
  variant?: ButtonProps['variant'];
  errorMessage?: string | null;
  showPreview?: boolean;
  showParameters?: boolean;
};

function ListItem<T>({
  active,
  selected,
  option,
  onClick,
  onDoubleClick,
  disabled,
}: {
  option: CatalogOption<T>;
  onClick?: () => void;
  onDoubleClick?: () => void;
  active: boolean;
  selected: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      className={active ? 'font-semibold' : ''}
      label={option.label}
      selected={selected}
      role="checkbox"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
    />
  );
}

export default function CatalogSelect<T extends SandboxObjectType>({
  options,
  containerClassName,
  className,
  label,
  placeholder,
  hideLabel,
  variant = 'filled',
  value,
  onChange,
  errorMessage,
  showParameters = false,
  showPreview = true,
}: CatalogSelectProps<T>) {
  const [selectedOption, setSelectedOption] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const selectedOptionTags = useMemo(() => {
    if (selectedOption === undefined) {
      return [];
    }

    return getSandboxObjectConfig(selectedOption.value).tags;
  }, [selectedOption]);

  const selectedOptionWriteup = useMemo(() => {
    if (selectedOption === undefined) {
      return undefined;
    }

    return (
      getSandboxObjectWriteup(selectedOption.value) ??
      `# ${selectedOption.label}`
    );
  }, [selectedOption]);

  const { mutateAsync: deleteObject } = useDeleteObjectMutation<T>();
  const [query, setQuery] = useState('');

  const objectInstance = useMemo(() => {
    if (selectedOption === undefined) {
      return null;
    }

    return evalSavedObject(selectedOption.value).mapLeft(() => null).value;
  }, [selectedOption]);

  const objectParameters = useMemo(() => {
    if (objectInstance === null) {
      return null;
    }

    if ('parameters' in objectInstance) {
      return objectInstance.parameters as SandboxParameters;
    }

    return null;
  }, [objectInstance]);

  const defaultObjectParameters = useMemo(() => {
    if (objectParameters === null) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getDefaultParameters(objectParameters) as Record<string, any>;
  }, [objectParameters]);

  const methods = useForm({
    defaultValues: defaultObjectParameters ?? {},
  });
  const { reset, getValues } = methods;

  useEffect(() => {
    reset(defaultObjectParameters ?? {});
  }, [defaultObjectParameters, reset]);

  const selectedObject = useMemo(
    () => selectedOption?.value ?? null,
    [selectedOption?.value],
  );

  const visualization = usePreviewVisualization(selectedObject, {
    enabled: open && showPreview,
  });

  // For mobile
  const [showItemDetails, setShowItemDetails] = useState(false);

  const { isMd } = useBreakpoint('md');

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  useEffect(() => {
    if (open) {
      setShowItemDetails(false);
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <div className="flex bg-surface h-[75dvh] lg:h-[400px]">
          <div
            className={clsx(
              'w-full md:w-auto flex flex-col border-r overflow-y-hidden',
              isMd && 'flex',
              !isMd && [showItemDetails ? 'hidden' : 'flex'],
            )}
          >
            <Input
              containerClassName="bg-surface mx-4 mt-4 sticky top-0"
              label="Search"
              type="search"
              hideLabel
              placeholder="Search..."
              value={query}
              onChange={handleQueryChange}
            />
            <div className="flex flex-col p-4 overflow-y-auto">
              {options
                .map((item) => {
                  if (isSelectGroup(item)) {
                    return {
                      ...item,
                      options: item.options.filter(
                        (item) =>
                          query === '' ||
                          item.label
                            .toLocaleLowerCase()
                            .includes(query.toLocaleLowerCase()),
                      ),
                    };
                  }
                  return item;
                })
                .filter(
                  (item) =>
                    query === '' ||
                    item.label
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase()) ||
                    isSelectGroup(item),
                )
                .filter(
                  (item) => !isSelectGroup(item) || item.options.length > 0,
                )
                .map((item) => {
                  if (isSelectGroup(item)) {
                    const areAllItemsDisabled = item.options.every(
                      (option) => option.disabled,
                    );

                    return (
                      <Fragment key={item.key}>
                        <div className="flex items-center pt-4 text-sm border-t">
                          <Chip disabled={areAllItemsDisabled}>
                            {item.label}
                          </Chip>
                        </div>
                        {item.options.map((option) => (
                          <ListItem
                            selected={option.key === selectedOption?.key}
                            active={option.key === selectedOption?.key}
                            disabled={option.disabled}
                            key={`${item.key}.${option.key}`}
                            option={option}
                            onClick={() => {
                              setSelectedOption?.(option);
                              setShowItemDetails(true);
                              // setStepIndex(0);
                            }}
                            onDoubleClick={() => {
                              onChange?.(option, null);
                              setOpen(false);
                            }}
                          />
                        ))}
                      </Fragment>
                    );
                  } else {
                    return (
                      <ListItem
                        selected={item.key === selectedOption?.key}
                        active={item.key === selectedOption?.key}
                        disabled={item.disabled}
                        key={item.key}
                        option={item}
                        onClick={() => {
                          setSelectedOption?.(item);
                          setShowItemDetails(true);
                        }}
                        onDoubleClick={() => {
                          onChange?.(item, null);
                          setOpen(false);
                        }}
                      />
                    );
                  }
                })}
            </div>
          </div>
          {selectedOption !== undefined && (showItemDetails || isMd) && (
            <div className="w-full md:w-[300px] overflow-y-auto">
              <Button
                className="md:hidden mx-4 mb-4"
                label="Back"
                variant="filled"
                icon={<MaterialSymbol icon="arrow_back" />}
                onClick={() => setShowItemDetails(false)}
              />
              {visualization && showPreview && (
                <div className="w-full lg:w-[300px] h-[200px] relative rounded-tr-md bg-canvas border-b overflow-clip">
                  <VisualizationRenderer
                    key={selectedOption.key}
                    className="absolute top-0 left-0 w-full h-full overflow-visible"
                    visualization={visualization}
                    zoom={1 / 3}
                  />
                </div>
              )}
              {!visualization && showPreview && (
                <div className="w-full lg:w-[300px] h-[200px] rounded-tr-md bg-canvas flex border-b justify-center items-center">
                  <span className="text-label">No preview available</span>
                </div>
              )}
              <div className="p-4 flex-col flex gap-2 items-start">
                <MarkdownPreview markdown={selectedOptionWriteup!} />
                <div className="flex gap-2 flex-wrap">
                  {selectedOptionTags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
                {showParameters && objectParameters && (
                  <div className="border-t mt-2 pt-4">
                    <FormProvider {...methods}>
                      <ParameterControls
                        showCustomize={false}
                        parameters={objectParameters}
                        onSave={() => {}}
                      />
                    </FormProvider>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="primary"
                    label="Select"
                    type="submit"
                    onClick={() => {
                      const parameterValues = getValues();
                      onChange?.(selectedOption, parameterValues);
                      setOpen(false);
                    }}
                  />
                  {selectedOption.type === 'custom' && (
                    <Button
                      variant="primary"
                      label="Delete"
                      onClick={async () => {
                        await deleteObject(selectedOption.value);
                        toast.success(`Deleted "${selectedOption.label}"`);
                        onChange?.(null, null);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className={clsx('flex flex-col min-w-[200px]', containerClassName)}>
        <div className="flex items-center gap-1">
          <FormLabel className={hideLabel ? 'hidden' : ''}>{label}</FormLabel>
          {errorMessage && (
            <Tooltip
              content={
                <div className="whitespace-pre font-mono">{errorMessage}</div>
              }
            >
              <MaterialSymbol
                className="!text-[16px] text-danger"
                icon="error"
              />
            </Tooltip>
          )}
        </div>
        <Button
          className={clsx(
            errorMessage ? 'border-2 border-danger' : '',
            className,
          )}
          label={value?.label ?? placeholder ?? ''}
          variant={variant}
          endIcon={<MaterialSymbol icon="arrow_drop_down" />}
        />
      </div>
    </Popover>
  );
}
