import {
  SandboxParameterizedAlgorithm,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';

import ParameterControls from './ParameterControls';

export type AlgorithmDetailsProps<
  N extends SandboxStateType,
  M extends SandboxStateType,
  P extends SandboxParameters,
> = {
  algorithm: SandboxParameterizedAlgorithm<N, M, P>;
};

export default function AlgorithmDetails<
  N extends SandboxStateType,
  M extends SandboxStateType,
  P extends SandboxParameters,
>({ algorithm }: AlgorithmDetailsProps<N, M, P>) {
  return (
    <div className="p-4 bg-surface">
      <div className="font-medium flex flex-col gap-2">
        <span>Algorithm parameters</span>
        <ParameterControls parameters={algorithm.parameters} />
      </div>
    </div>
  );
}
