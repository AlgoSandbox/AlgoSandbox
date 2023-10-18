import {
  counterToSearchGraphStateAdapter,
  searchGraphStateToCounterAdapter,
} from '@algo-sandbox/adapters';
import * as Algorithms from '@algo-sandbox/algorithms';
import {
  SandboxAdapter,
  SandboxParameteredProblem,
  SandboxProblem,
  SandboxStateName,
} from '@algo-sandbox/core';
import { SandboxParameters } from '@algo-sandbox/core';
import * as Problems from '@algo-sandbox/problems';
import * as Visualizers from '@algo-sandbox/visualizers';
import { SandboxAnyAlgorithm, SandboxAnyVisualizer } from '@types';

import { SelectGroup, SelectOption, SelectOptions } from '../components/ui';

export type CatalogOption<T> = SelectOption<T> & {
  type: 'custom' | 'built-in';
};

export type CatalogGroup<T> = Omit<SelectGroup<T>, 'options'> & {
  options: Array<CatalogOption<T>>;
};

export type CatalogOptions<T> = Array<CatalogGroup<T> | CatalogOption<T>>;

export const algorithmOptions: Array<CatalogGroup<SandboxAnyAlgorithm | null>> =
  Object.entries(Algorithms).map(([groupKey, values]) => ({
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
    | SandboxParameteredProblem<SandboxStateName, SandboxParameters>
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

export const visualizerOptions: Array<SelectGroup<SandboxAnyVisualizer>> = [
  {
    key: 'graphs',
    label: 'Graphs',
    options: [
      {
        key: 'searchGraph',
        label: 'Search graph',
        value: Visualizers.graphs.searchGraph,
      },
      {
        key: 'nodeGraph',
        label: 'Node graph',
        value: Visualizers.graphs.parametered.nodeGraph,
      },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
