import {
  SandboxAlgorithm,
  SandboxParameterizedAlgorithm,
  SandboxParameterizedProblem,
  SandboxParameterizedVisualizer,
  SandboxParameters,
  SandboxProblem,
  SandboxStateName,
  SandboxVisualizer,
} from '@algo-sandbox/core';

export function isParameterizedAlgorithm<
  N extends SandboxStateName,
  M extends SandboxStateName,
  P extends SandboxParameters,
>(
  algorithm: SandboxAlgorithm<N, M> | SandboxParameterizedAlgorithm<N, M, P>
): algorithm is SandboxParameterizedAlgorithm<N, M, P> {
  return (
    (algorithm as SandboxParameterizedAlgorithm<N, M, P>).parameters !==
    undefined
  );
}

export function isParameterizedVisualizer<
  N extends SandboxStateName,
  P extends SandboxParameters,
>(
  visualizer: SandboxVisualizer<N> | SandboxParameterizedVisualizer<N, P>
): visualizer is SandboxParameterizedVisualizer<N, P> {
  return (
    (visualizer as SandboxParameterizedVisualizer<N, P>).parameters !==
    undefined
  );
}

export function isParameterizedProblem<
  N extends SandboxStateName,
  P extends SandboxParameters,
>(
  problem: SandboxProblem<N> | SandboxParameterizedProblem<N, P>
): problem is SandboxParameterizedProblem<N, P> {
  return (
    (problem as SandboxParameterizedProblem<N, P>).parameters !== undefined
  );
}
