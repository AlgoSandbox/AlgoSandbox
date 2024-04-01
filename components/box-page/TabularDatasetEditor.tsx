import { tabularDatasetState } from '@algo-sandbox/problems/tabular';
import { Button, MaterialSymbol, ResizeHandle } from '@components/ui';
import Dialog from '@components/ui/Dialog';
import Heading from '@components/ui/Heading';
import { uniq } from 'lodash';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { CellBase, Matrix } from 'react-spreadsheet';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';
import { z } from 'zod';

import StyledSpreadsheet from './StyledSpreadsheet';

const initialTrainingSet = {
  xLabels: ['Income', 'Credit History', 'Debt'],
  data: [
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Bad',
        Debt: 'Low',
      },
      yValue: 'Reject',
    },
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'High',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: '0 - 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: '0 - 10k',
        'Credit History': 'Good',
        Debt: 'Low',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Bad',
        Debt: 'Low',
      },
      yValue: 'Reject',
    },
    {
      xValues: {
        Income: 'Over 10k',
        'Credit History': 'Good',
        Debt: 'High',
      },
      yValue: 'Approve',
    },
    {
      xValues: {
        Income: '0 - 10k',
        'Credit History': 'Bad',
        Debt: 'High',
      },
      yValue: 'Reject',
    },
  ],
};

type TrainingSet = z.infer<typeof tabularDatasetState.shape>;

function TabularDatasetEditor({
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
    const xLabels = initialTrainingSet.xLabels;
    const data = initialTrainingSet.data;

    const initialData: Matrix<CellBase<string>> = [
      [...xLabels, 'Decision'].map((xLabel) => ({ value: xLabel })),
      ...data.map((example) => [
        ...xLabels.map((xLabel) => ({
          value: example.xValues[xLabel],
        })),
        { value: example.yValue },
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

  const xLabels = useMemo(() => {
    const headers = data[0]
      .slice(0, -1)
      .map((cell, index) => cell?.value || `x${index}`);
    return headers;
  }, [data]);

  const parsedData = useMemo(() => {
    const examples = data.slice(1).map((row) => {
      const rowXValues = row.slice(0, -1).map((cell) => cell?.value ?? '');
      const xValues = Object.fromEntries(
        xLabels.map((xLabel, index) => [xLabel, rowXValues[index]]),
      );
      const yValue = row[row.length - 1]?.value ?? '';
      return { xValues, yValue };
    });
    return examples;
  }, [xLabels, data]);

  const yValues = useMemo(() => {
    const yValues = data
      .slice(1)
      .map((row) => row[row.length - 1]?.value ?? '');
    return uniq(yValues).filter((yValue) => yValue !== '');
  }, [data]);

  const { resolvedTheme } = useTheme();

  const xValuesByLabel = useMemo(() => {
    const xValuesByLabel: Record<string, string[]> = {};
    xLabels.forEach((xLabel) => {
      xValuesByLabel[xLabel] = uniq(
        parsedData.map((item) => item.xValues[xLabel]),
      ).filter((value) => value !== '');
    });
    return xValuesByLabel;
  }, [xLabels, parsedData]);

  const onSaveClick = useCallback(() => {
    onSave({
      xLabels,
      data: parsedData,
    });
  }, [xLabels, onSave, parsedData]);

  const onDataEntryAdd = useCallback(() => {
    setData((prevData) => {
      const newRow = xLabels.map(() => ({ value: '' }));
      return [...prevData, newRow];
    });
  }, [xLabels]);

  const onXAdd = useCallback(() => {
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
                label="Import CSV"
                onClick={openFilePicker}
                variant="primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                label="Add data entry"
                variant="filled"
                onClick={onDataEntryAdd}
              />
              <Button
                label="Add x attribute"
                variant="filled"
                onClick={onXAdd}
              />
            </div>
            <div className="flex flex-1 flex-col gap-y-4 overflow-auto pe-4">
              <div className="flex flex-col p-2 bg-surface-high rounded border">
                <Heading className="mb-2" variant="h4">
                  Dataset
                </Heading>
                <ul className="flex flex-col gap-2">
                  {xLabels.map((xLabel, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="font-mono text-xs flex gap-1 items-center flex-wrap">
                        <pre className="-me-1">{xLabel} = </pre>
                        {xValuesByLabel[xLabel].map((xValue) => (
                          <span
                            key={xValue}
                            className="font-bold text-accent px-1 py-0.5 border border-accent rounded"
                          >
                            {xValue}
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
                      <pre>y = </pre>
                      <ul className="inline-flex gap-1">
                        {yValues.map((yValue) => (
                          <li
                            key={yValue}
                            className="font-bold text-accent px-1 py-0.5 border border-accent rounded"
                          >
                            {yValue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
              <ul className="flex flex-col gap-y-4 border-t pt-4">
                {parsedData.map((example, index) => (
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
                      {Object.entries(example.xValues).map(
                        ([xLabel, value]) => (
                          <li key={xLabel}>
                            <div className="font-mono text-xs flex items-center flex-wrap">
                              <pre>{xLabel} = </pre>
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
                          <pre>y = </pre>
                          {example.yValue !== '' && (
                            <span className="font-bold text-accent px-1 py-0.5 border border-accent rounded">
                              {example.yValue}
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

export default function TabularDatasetEditorDialog({
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
      return tabularDatasetState.shape.parse(JSON.parse(value));
    } catch {
      return initialTrainingSet;
    }
  }, [value]);

  return (
    <Dialog
      title="Tabular dataset editor"
      content={
        <TabularDatasetEditor
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
