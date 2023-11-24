import 'reactflow/dist/style.css';

import { Button, Popover } from '@components/ui';
import React, { useMemo } from 'react';
import ReactFlow, { Handle, Position } from 'reactflow';

import { useBoxContext } from '..';

type VisualizerNodeProps = {
  data: {
    inputs?: Array<{
      id: string;
      label: string;
    }>;
    outputs?: Array<{
      id: string;
      label: string;
    }>;
    label: string;
  };
};

function FlowNode({
  data: { inputs = [], outputs = [], label },
}: VisualizerNodeProps) {
  return (
    <div className="border ps-8 py-4 relative h-[100px] w-[500px] flex items-center justify-center rounded">
      <div>{label}</div>
      {inputs.map(({ id, label }, index) => (
        <Handle
          className="relative"
          style={{ top: 20 * index + 16 }}
          key={id}
          type="target"
          position={Position.Left}
          id={id}
        >
          <span className="absolute start-2 -mt-2 font-mono">{label}</span>
        </Handle>
      ))}
      {outputs.map(({ id, label }, index) => (
        <Handle
          className="relative"
          style={{ top: 20 * index + 16 }}
          key={id}
          type="source"
          position={Position.Right}
          id={id}
        >
          <span className="absolute end-2 -mt-2 font-mono">{label}</span>
        </Handle>
      ))}
    </div>
  );
}

export default function AlgorithmVisualizerFlowChartPopover() {
  const algorithm = useBoxContext('algorithm.instance');
  const visualizer = useBoxContext('visualizer.instance');

  const algorithmName = algorithm?.name ?? 'Untitled algorithm';
  const visualizerName = visualizer?.name ?? 'Untitled visualizer';

  const nodeTypes = useMemo(
    () => ({
      customFlow: FlowNode,
    }),
    [],
  );

  const algorithmOutputs = Object.keys(algorithm?.outputs.shape.shape ?? {});
  const visualizerInputs = Object.keys(visualizer?.accepts.shape.shape ?? {});

  const nodes = useMemo(
    () => [
      {
        id: 'algorithm',
        type: 'customFlow',
        position: { x: 0, y: 0 },
        data: {
          label: algorithmName,
          outputs: algorithmOutputs.map((param) => ({
            id: param,
            label: param,
          })),
        },
      },
      {
        id: 'visualizer',
        type: 'customFlow',
        position: { x: 700, y: 100 },
        data: {
          label: visualizerName,
          inputs: visualizerInputs.map((param) => ({
            id: param,
            label: param,
          })),
        },
      },
    ],
    [algorithmName, algorithmOutputs, visualizerName, visualizerInputs],
  );

  const edges = useMemo(() => {
    return visualizerInputs.map((parameterName) => ({
      id: 'parameterName',
      source: 'algorithm',
      sourceHandle: parameterName,
      target: 'visualizer',
      targetHandle: parameterName,
    }));
  }, [visualizerInputs]);

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
