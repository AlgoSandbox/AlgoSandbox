import {
  SandboxParameters,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxStateName,
} from '@/lib/algo-sandbox/core';
import ParameterControls from './ParameterControls';
import { isParameteredAlgorithm } from '@/utils/isParametered';

export type AlgorithmDetailsProps<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters
> = {
  algorithm: SandboxAlgorithm<N, M> | SandboxParameteredAlgorithm<N, M, P>;
};

export default function AlgorithmDetails<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters
>({ algorithm }: AlgorithmDetailsProps<N, M, P>) {
  return (
    <div className='p-4'>
      {isParameteredAlgorithm(algorithm) && (
        <div className="font-medium flex flex-col gap-2">
          <span>Algorithm parameters</span>
          <ParameterControls parameters={algorithm.parameters} />
        </div>
      )}
    </div>
  );
}
