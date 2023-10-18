import {
  SandboxParameters,
  SandboxParameteredAlgorithm,
  SandboxStateName,
} from '@algo-sandbox/core';
import ParameterControls from './ParameterControls';

export type AlgorithmDetailsProps<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters
> = {
  algorithm: SandboxParameteredAlgorithm<N, M, P>;
};

export default function AlgorithmDetails<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters
>({ algorithm }: AlgorithmDetailsProps<N, M, P>) {
  return (
    <div className="p-4 bg-white">
      <div className="font-medium flex flex-col gap-2">
        <span>Algorithm parameters</span>
        <ParameterControls parameters={algorithm.parameters} />
      </div>
    </div>
  );
}
