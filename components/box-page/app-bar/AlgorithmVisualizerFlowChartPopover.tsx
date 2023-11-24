import 'reactflow/dist/style.css';

import { Button, Popover } from '@components/ui';
import React, { useCallback, useMemo } from 'react';
import ReactFlow, { Handle, Position } from 'reactflow';

import { useBoxContext } from '..';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func: Function) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  const result =
    fnStr
      .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
      .match(ARGUMENT_NAMES) ?? [];
  return result;
}

type VisualizerNodeProps = {
  data: {
    parameterNames: Array<string>;
    label: string;
  };
};

function VisualizerNode({
  data: { parameterNames, label },
}: VisualizerNodeProps) {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="border p-4">
      <div>{label}</div>
      {parameterNames.map((parameterName) => (
        <Handle
          key={parameterName}
          type="target"
          position={Position.Left}
          id={parameterName}
        />
      ))}
    </div>
  );
}

export default function AlgorithmVisualizerFlowChartPopover() {
  const visualizer = useBoxContext('visualizer.instance');

  const parameterNames = useMemo(() => {
    if (visualizer?.visualize) {
      return getParamNames(visualizer.visualize);
    }

    return [];
  }, [visualizer?.visualize]);

  const visualizerName = visualizer?.name ?? 'Error';

  const nodeTypes = useMemo(
    () => ({
      visualizer: VisualizerNode,
    }),
    []
  );

  console.log();

  const nodes = useMemo(
    () => [
      { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
      {
        id: 'visualizer',
        type: 'visualizer',
        position: { x: 0, y: 100 },
        data: { label: visualizerName, parameterNames },
      },
    ],
    [visualizerName, parameterNames]
  );

  const edges = useMemo(() => {
    return parameterNames.map((parameterName) => ({
      id: 'e1-2',
      source: '1',
      target: 'visualizer',
      targetHandle: parameterName,
    }));
  }, [parameterNames]);

  return (
    <Popover
      content={
        <div className="w-[500px] h-[400px] bg-white">
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} />
        </div>
      }
    >
      <Button label="View flowchart" />
    </Popover>
  );
}
