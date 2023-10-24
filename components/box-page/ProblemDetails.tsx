import {
  SandboxParameteredProblem,
  SandboxParameters,
  SandboxStateName,
} from '@algo-sandbox/core';

import ParameterControls from './ParameterControls';

export type ProblemDetailsProps<
  N extends SandboxStateName,
  P extends SandboxParameters
> = {
  problem: SandboxParameteredProblem<N, P>;
};

export default function ProblemDetails<
  N extends SandboxStateName,
  P extends SandboxParameters
>({ problem }: ProblemDetailsProps<N, P>) {
  return (
    <div className="p-4 bg-white">
      <div className="font-medium flex flex-col gap-2">
        <span>Problem parameters</span>
        <ParameterControls parameters={problem.parameters} />
      </div>
    </div>
  );
}
