/* eslint-disable @typescript-eslint/no-explicit-any */
import * as adapters from '@algo-sandbox/adapters';
import * as algorithms from '@algo-sandbox/algorithms';
import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxBox,
  SandboxParameterizedAlgorithm,
  SandboxParameterizedProblem,
  SandboxParameterizedVisualizer,
  SandboxProblem,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
import * as visualizers from '@algo-sandbox/visualizers';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameterizedAlgorithm<any, any, any>;

export type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameterizedProblem<any, any>;

export type SandboxAnyVisualizer =
  | SandboxVisualizer<any>
  | SandboxParameterizedVisualizer<any, any>;

export type SandboxAnyAdapter = SandboxAdapter<any, any>;

type SandboxAnyComponent =
  | SandboxAnyAdapter
  | SandboxAnyAlgorithm
  | SandboxAnyProblem
  | SandboxAnyVisualizer
  | SandboxBox;

type IsSandboxComponent<T> = T extends SandboxAnyComponent ? true : false;

export type ComponentPaths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: IsSandboxComponent<T[K]> extends true
        ? `${Exclude<K, symbol>}`
        : `${Exclude<K, symbol>}.${ComponentPaths<T[K]>}`;
    }[keyof T]
  : never;

type RelativeSandboxKey = '.';

export type SandboxAlgorithmKey =
  | `algorithm.${ComponentPaths<typeof algorithms>}`
  | RelativeSandboxKey;
export type SandboxProblemKey =
  | `problem.${ComponentPaths<typeof problems>}`
  | RelativeSandboxKey;
export type SandboxVisualizerKey =
  | `visualizer.${ComponentPaths<typeof visualizers>}`
  | RelativeSandboxKey;
export type SandboxAdapterKey =
  | `adapter.${ComponentPaths<typeof adapters>}`
  | RelativeSandboxKey;
export type SandboxBoxKey = `box.${ComponentPaths<typeof adapters>}`;

type SandboxKeyMap = {
  algorithm: SandboxAlgorithmKey;
  problem: SandboxProblemKey;
  visualizer: SandboxVisualizerKey;
  adapter: SandboxAdapterKey;
  box: SandboxBoxKey;
};

export type SandboxObjectType = keyof SandboxKeyMap;

type SandboxComponentMap = {
  algorithm: SandboxAnyAlgorithm;
  problem: SandboxAnyProblem;
  visualizer: SandboxAnyVisualizer;
  adapter: SandboxAnyAdapter;
  box: SandboxBox;
};

export type SandboxKey<K extends SandboxObjectType = SandboxObjectType> =
  SandboxKeyMap[K];
export type SandboxComponent<K extends SandboxObjectType = SandboxObjectType> =
  SandboxComponentMap[K];