import {
  SandboxParameters,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameteredVisualizer,
  SandboxVisualizer,
  SandboxStateName,
  SandboxProblem,
  SandboxParameteredProblem,
} from '@/lib/algo-sandbox/core';

export function isParameteredAlgorithm<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters
>(
  algorithm: SandboxAlgorithm<N, M> | SandboxParameteredAlgorithm<N, M, P>
): algorithm is SandboxParameteredAlgorithm<N, M, P> {
  return (
    (algorithm as SandboxParameteredAlgorithm<N, M, P>).parameters !== undefined
  );
}

export function isParameteredVisualizer<
  N extends SandboxStateName,
  P extends SandboxParameters
>(
  visualizer: SandboxVisualizer<N> | SandboxParameteredVisualizer<N, P>
): visualizer is SandboxParameteredVisualizer<N, P> {
  return (
    (visualizer as SandboxParameteredVisualizer<N, P>).parameters !== undefined
  );
}

export function isParameteredProblem<
  N extends SandboxStateName,
  P extends SandboxParameters
>(
  problem: SandboxProblem<N> | SandboxParameteredProblem<N, P>
): problem is SandboxParameteredProblem<N, P> {
  return (problem as SandboxParameteredProblem<N, P>).parameters !== undefined;
}
