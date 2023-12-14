import {
  SandboxParameterizedProblem,
  SandboxParameters,
  SandboxStateType,
} from '@algo-sandbox/core';

import ParameterControls from './ParameterControls';

export type ProblemDetailsProps<
  N extends SandboxStateType,
  P extends SandboxParameters,
> = {
  problem: SandboxParameterizedProblem<N, P>;
};

export default function ProblemDetails<
  N extends SandboxStateType,
  P extends SandboxParameters,
>({ problem }: ProblemDetailsProps<N, P>) {
  return (
    <div className="p-4 bg-surface">
      <div className="font-medium flex flex-col gap-2">
        <span>Problem parameters</span>
        <ParameterControls parameters={problem.parameters} />
      </div>
    </div>
  );
}
