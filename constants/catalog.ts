import {
  counterToSearchGraphStateAdapter,
  searchGraphStateToCounterAdapter,
} from '@algo-sandbox/adapters';
import * as Algorithms from '@algo-sandbox/algorithms';
import {
  SandboxAdapter,
  SandboxAlgorithm,
  SandboxParameteredAlgorithm,
  SandboxParameteredProblem,
  SandboxParameteredVisualizer,
  SandboxProblem,
  SandboxStateName,
  SandboxVisualizer,
} from '@algo-sandbox/core';
import Problems from '@algo-sandbox/problems';
import Visualizers from '@algo-sandbox/visualizers';

import { SelectGroup, SelectOption, SelectOptions } from '../components/ui';

export type CatalogOption<T> = SelectOption<T> & {
  type: 'custom' | 'built-in';
};

export type CatalogGroup<T> = Omit<SelectGroup<T>, 'options'> & {
  options: Array<CatalogOption<T>>;
};

export type CatalogOptions<T> = Array<CatalogGroup<T> | CatalogOption<T>>;

export const algorithmOptions: Array<
  CatalogGroup<
    | SandboxAlgorithm<SandboxStateName, any>
    | SandboxParameteredAlgorithm<SandboxStateName, any, any>
    | null
  >
> = Object.entries(Algorithms).map(([groupKey, values]) => ({
  key: groupKey,
  label: groupKey,
  options: Object.entries(values).map(([algorithmKey, algorithm]) => ({
    key: algorithmKey,
    label: algorithm.name,
    type: 'built-in',
    value: algorithm,
  })),
}));

export const problemOptions: Array<
  SelectGroup<
    | SandboxProblem<SandboxStateName>
    | SandboxParameteredProblem<SandboxStateName, any>
  >
> = Object.entries(Problems).map(([groupKey, values]) => ({
  key: groupKey,
  label: groupKey,
  options: Object.entries(values).map(([problemKey, problem]) => ({
    key: problemKey,
    label: problem.name,
    value: problem,
  })),
}));

export const visualizerOptions: Array<
  SelectGroup<SandboxVisualizer<any> | SandboxParameteredVisualizer<any, any>>
> = [
  {
    key: 'graphs',
    label: 'Graphs',
    options: [
      {
        key: 'searchGraph',
        label: 'Search graph',
        value: Visualizers.Graphs.searchGraph,
      },
      {
        key: 'nodeGraph',
        label: 'Node graph',
        value: Visualizers.Graphs.Parametered.nodeGraph,
      },
    ],
  },
];

export const adapterOptions: SelectOptions<SandboxAdapter<any, any>> = [
  {
    key: 'counterToSearch',
    label: 'Counter to search graph',
    value: counterToSearchGraphStateAdapter,
  },
  {
    key: 'searchToCounter',
    label: 'Search graph to counter',
    value: searchGraphStateToCounterAdapter,
  },
];
