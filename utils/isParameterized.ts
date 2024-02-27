import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxParameterizedAdapter,
  SandboxParameterizedAlgorithm,
  SandboxParameterizedProblem,
  SandboxParameterizedVisualizer,
  SandboxParameters,
  SandboxProblem,
  SandboxStateType,
  SandboxVisualizer,
} from '@algo-sandbox/core';

export function isParameterizedAlgorithm<
  N extends SandboxStateType,
  M extends SandboxStateType,
  P extends SandboxParameters,
>(
  algorithm: SandboxAlgorithm<N, M> | SandboxParameterizedAlgorithm<N, M, P>,
): algorithm is SandboxParameterizedAlgorithm<N, M, P> {
  return (
    (algorithm as SandboxParameterizedAlgorithm<N, M, P>).parameters !==
    undefined
  );
}

export function isParameterizedVisualizer<
  N extends SandboxStateType,
  V,
  P extends SandboxParameters,
>(
  visualizer: SandboxVisualizer<N, V> | SandboxParameterizedVisualizer<N, V, P>,
): visualizer is SandboxParameterizedVisualizer<N, V, P> {
  return (
    (visualizer as SandboxParameterizedVisualizer<N, V, P>).parameters !==
    undefined
  );
}

export function isParameterizedProblem<
  N extends SandboxStateType,
  P extends SandboxParameters,
>(
  problem: SandboxProblem<N> | SandboxParameterizedProblem<N, P>,
): problem is SandboxParameterizedProblem<N, P> {
  return (
    (problem as SandboxParameterizedProblem<N, P>).parameters !== undefined
  );
}

export function isParameterizedAdapter<
  T extends SandboxStateType,
  U extends SandboxStateType,
  P extends SandboxParameters,
>(
  adapter: SandboxAdapter<T, U> | SandboxParameterizedAdapter<T, U, P>,
): adapter is SandboxParameterizedAdapter<T, U, P> {
  return (
    (adapter as SandboxParameterizedAdapter<T, U, P>).parameters !== undefined
  );
}
