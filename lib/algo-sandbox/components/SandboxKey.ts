/* eslint-disable @typescript-eslint/no-explicit-any */
import * as adapters from '@algo-sandbox/adapters';
import * as algorithms from '@algo-sandbox/algorithms';
import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxBox,
  SandboxParameterizedAlgorithm,
  SandboxParameterizedEnvironment,
  SandboxParameterizedProblem,
  SandboxParameterizedVisualizer,
  SandboxProblem,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import * as problems from '@algo-sandbox/problems';
import * as visualizers from '@algo-sandbox/visualizers';
import { Get } from '@utils/RecursivePath';
import { z } from 'zod';

export type SandboxAnyAlgorithm =
  | SandboxAlgorithm<any, any>
  | SandboxParameterizedAlgorithm<any, any, any>;

export type SandboxAnyProblem =
  | SandboxProblem<any>
  | SandboxParameterizedProblem<any, any>
  // Workaround: the line below is required even though parameterized environments are
  // parameterized problems. This is as Typescript is not
  // eager in evaluating conditional types like "T extends A".
  // So "T extends SandboxParameterizedEnvironment" can be true,
  // and "SandboxParameterizedEnvironment extends SandboxParameterizedProblem" is true.
  // but "T extends SandboxParameterizedEnvironment" is false.
  // This is required for SandboxProblemKey to be inferred correctly.
  | SandboxParameterizedEnvironment<any, any, any>;

export type SandboxAnyVisualizer =
  | SandboxVisualizer<any, any>
  | SandboxParameterizedVisualizer<any, any, any>;

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
  | RelativeSandboxKey
  | (string & Record<never, never>);
export type SandboxProblemKey =
  | `problem.${ComponentPaths<typeof problems>}`
  | RelativeSandboxKey
  | (string & Record<never, never>);
export type SandboxVisualizerKey =
  | `visualizer.${ComponentPaths<typeof visualizers>}`
  | RelativeSandboxKey
  | (string & Record<never, never>);
export type SandboxAdapterKey =
  | `adapter.${ComponentPaths<typeof adapters>}`
  | RelativeSandboxKey
  | (string & Record<never, never>);
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
  SandboxKeyMap[K] & string;
export type SandboxComponent<K extends SandboxObjectType = SandboxObjectType> =
  SandboxComponentMap[K];

type AdapterWithKey<T extends SandboxAdapterKey> =
  T extends `adapter.${infer P}` ? Get<typeof adapters, P> : never;

export type SandboxAdapterInput<T extends SandboxAdapterKey> = keyof z.infer<
  AdapterWithKey<T>['accepts']['shape']
>;

export type SandboxAdapterOutput<T extends SandboxAdapterKey> = keyof z.infer<
  AdapterWithKey<T>['outputs']['shape']
>;
