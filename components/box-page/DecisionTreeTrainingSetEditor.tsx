import { decisionTreeTrainingSetState } from '@algo-sandbox/problems/decision-trees';
import { Button, MaterialSymbol, ResizeHandle } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import Heading from '@components/ui/Heading';
import { uniq } from 'lodash';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { CellBase, Matrix } from 'react-spreadsheet';
import { toast } from 'sonner';
import { useFilePicker, useImperativeFilePicker } from 'use-file-picker';
import { read as readXlsx } from 'xlsx';
import { z } from 'zod';

import StyledSpreadsheet from './StyledSpreadsheet';

const initialTrainingSet = {
  attributes: ['Income', 'Credit History', 'Debt'],
  examples: [
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Bad',
        Debt: 'Low',
      },
      classification: 'Reject',
    },
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'High',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: '0 - 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: '0 - 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Bad',
        Debt: 'Low',
      },
      classification: 'Reject',
    },
    {
      attributes: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'High',
      },
      classification: 'Approve',
    },
    {
      attributes: {
        Income: '0 - 10k',
        'Credit History': 'Bad',
        Debt: 'High',
      },
      classification: 'Reject',
    },
  ],
};

type TrainingSet = z.infer<typeof decisionTreeTrainingSetState.shape>;

function DecisionTreeTrainingSetEditor({
  onCancel,
  onSave,
  initialData: initialTrainingSet,
}: {
  onCancel: () => void;
  onSave: (trainingSet: TrainingSet) => void;
  initialData: TrainingSet;
}) {
  const { openFilePicker, filesContent } = useFilePicker({
    accept: ['.csv'],
  });

  const initialData = useMemo(() => {
    // map from training set
    const attributes = initialTrainingSet.attributes;
    const examples = initialTrainingSet.examples;

    const initialData: Matrix<CellBase<string>> = [
      [...attributes, 'Decision'].map((attribute) => ({ value: attribute })),
      ...examples.map((example) => [
        ...attributes.map((attribute) => ({
          value: example.attributes[attribute],
        })),
        { value: example.classification },
      ]),
    ];

    return initialData;
  }, [initialTrainingSet]);

  const [data, setData] = useState<Matrix<CellBase<string>>>(initialData);

  useEffect(() => {
    const selectedFileContent = filesContent.at(0);

    if (selectedFileContent === undefined) {
      return;
    }

    if (selectedFileContent.name.endsWith('.csv')) {
      const newData: Matrix<CellBase<string>> = selectedFileContent.content
        .split('\n')
        .filter((row) => row !== '')
        .map((row) => {
          return row.split(',').map((cell) => ({ value: cell }));
        });

      if (newData.length === 0) {
        toast.error('No data found in the CSV file');
        return;
      }

      setData(newData);
    }
  }, [filesContent]);

  const attributes = useMemo(() => {
    const headers = data[0]
      .slice(0, -1)
      .map((cell, index) => cell?.value || `Attribute ${index + 1}`);
    return headers;
  }, [data]);

  const examples = useMemo(() => {
    const examples = data.slice(1).map((row) => {
      const attributeValues = row.slice(0, -1).map((cell) => cell?.value ?? '');
      const attributeMap = Object.fromEntries(
        attributes.map((attribute, index) => [
          attribute,
          attributeValues[index],
        ]),
      );
      const classification = row[row.length - 1]?.value ?? '';
      return { attributes: attributeMap, classification };
    });
    return examples;
  }, [attributes, data]);

  const classifications = useMemo(() => {
    const classifications = data
      .slice(1)
      .map((row) => row[row.length - 1]?.value ?? '');
    return uniq(classifications).filter(
      (classification) => classification !== '',
    );
  }, [data]);

  const { resolvedTheme } = useTheme();

  const attributeValues = useMemo(() => {
    const attributeValues: Record<string, string[]> = {};
    attributes.forEach((attribute) => {
      attributeValues[attribute] = uniq(
        examples.map((example) => example.attributes[attribute]),
      ).filter((value) => value !== '');
    });
    return attributeValues;
  }, [attributes, examples]);

  const onSaveClick = useCallback(() => {
    onSave({
      attributes,
      examples,
    });
  }, [attributes, examples, onSave]);

  const onExampleAdd = useCallback(() => {
    setData((prevData) => {
      const newRow = attributes.map(() => ({ value: '' }));
      return [...prevData, newRow];
    });
  }, [attributes]);

  const onAttributeAdd = useCallback(() => {
    // add new column to the second rightmost position
    setData((prevData) => {
      return prevData.map((row) => [
        ...row.slice(0, -1),
        {
          value: '',
        },
        row[row.length - 1],
      ]);
    });
  }, []);

  return (
    <div className="w-full flex flex-col flex-1 overflow-hidden">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30}>
          <div className="flex flex-col gap-y-4 pt-2 h-full overflow-y-hidden">
            <div className="flex">
              <Button
                label="Import"
                onClick={openFilePicker}
                variant="primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                label="Add example"
                variant="filled"
                onClick={onExampleAdd}
              />
              <Button
                label="Add attribute"
                variant="filled"
                onClick={onAttributeAdd}
              />
            </div>
            <div className="flex flex-1 flex-col gap-y-4 overflow-auto pe-4">
              <div className="flex flex-col p-2 bg-surface-high rounded border">
                <Heading className="mb-2" variant="h4">
                  Dataset
                </Heading>
                <ul className="flex flex-col gap-2">
                  {attributes.map((attribute, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="font-mono text-xs flex gap-1 items-center flex-wrap">
                        <pre className="-me-1">{attribute} = </pre>
                        {attributeValues[attribute].map((attributeValue) => (
                          <span
                            key={attributeValue}
                            className="font-bold text-accent px-1 py-0.5 border border-accent rounded"
                          >
                            {attributeValue}
                          </span>
                        ))}
                      </div>
                      <Button
                        label="Remove"
                        hideLabel
                        size="sm"
                        variant="filled"
                        onClick={() => {
                          setData((prevData) =>
                            prevData.map((row) =>
                              row.filter((_, i) => i !== index),
                            ),
                          );
                        }}
                        icon={<MaterialSymbol icon="delete" />}
                      />
                    </li>
                  ))}
                  <li className="border-t mt-2 pt-2">
                    <div className="font-mono text-xs flex items-center flex-wrap">
                      <pre>Classifications = </pre>
                      <ul className="inline-flex gap-1">
                        {classifications.map((classification) => (
                          <li
                            key={classification}
                            className="font-bold text-accent px-1 py-0.5 border border-accent rounded"
                          >
                            {classification}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
              <ul className="flex flex-col gap-y-4 border-t pt-4">
                {examples.map((example, index) => (
                  <li
                    key={index}
                    className="bg-surface-high border rounded p-2"
                  >
                    <div className="flex justify-between items-center">
                      <Heading className="mb-2" variant="h4">
                        Example {index + 1}
                      </Heading>
                      <Button
                        label="Remove"
                        hideLabel
                        size="sm"
                        variant="filled"
                        onClick={() => {
                          setData((prevData) =>
                            prevData.filter((_, i) => i !== index + 1),
                          );
                        }}
                        icon={<MaterialSymbol icon="delete" />}
                      />
                    </div>
                    <ul className="flex flex-col gap-y-2">
                      {Object.entries(example.attributes).map(
                        ([attribute, value]) => (
                          <li key={attribute}>
                            <div className="font-mono text-xs flex items-center flex-wrap">
                              <pre>{attribute} = </pre>
                              {value !== '' && (
                                <span className="font-bold text-accent px-1 py-0.5 border border-accent rounded">
                                  {value}
                                </span>
                              )}
                            </div>
                          </li>
                        ),
                      )}
                      <li className="border-t mt-2 pt-2">
                        <div className="font-mono text-xs flex items-center flex-wrap">
                          <pre>Classification = </pre>
                          {example.classification !== '' && (
                            <span className="font-bold text-accent px-1 py-0.5 border border-accent rounded">
                              {example.classification}
                            </span>
                          )}
                        </div>
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button label="Cancel" onClick={onCancel} />
              <Button label="Save" variant="primary" onClick={onSaveClick} />
            </div>
          </div>
        </Panel>
        <ResizeHandle />
        <Panel>
          <StyledSpreadsheet
            data={data}
            onChange={setData}
            darkMode={resolvedTheme === 'dark'}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default function DecisionTreeTrainingSetEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  const onCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onTrainingSetSave = useCallback(
    (trainingSet: TrainingSet) => {
      onChange(JSON.stringify(trainingSet));
      onOpenChange(false);
    },
    [onChange, onOpenChange],
  );

  const initialData = useMemo(() => {
    try {
      return decisionTreeTrainingSetState.shape.parse(JSON.parse(value));
    } catch {
      return initialTrainingSet;
    }
  }, [value]);

  return (
    <Dialog
      title="Decision tree problem editor"
      content={
        <DecisionTreeTrainingSetEditor
          initialData={initialData}
          onSave={onTrainingSetSave}
          onCancel={onCancel}
        />
      }
      size="full"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
