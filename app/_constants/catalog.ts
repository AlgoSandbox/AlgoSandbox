import { SelectGroup, SelectOptions } from '@/components/Select';
import {
  counterToSearchGraphStateAdapter,
  searchGraphStateToCounterAdapter,
} from '@/lib/algo-sandbox/adapters';
import Algorithms from '@/lib/algo-sandbox/algorithms';
import {
  SandboxAlgorithm,
  SandboxStateName,
  SandboxParameteredAlgorithm,
  SandboxParameteredProblem,
  SandboxProblem,
  SandboxAdapter,
  SandboxParameteredVisualizer,
  SandboxVisualizer,
} from '@/lib/algo-sandbox/core';
import Problems from '@/lib/algo-sandbox/problems';
import Visualizers from '@/lib/algo-sandbox/visualizers';

export const algorithmOptions: Array<
  SelectGroup<
    | SandboxAlgorithm<SandboxStateName, any>
    | SandboxParameteredAlgorithm<SandboxStateName, any, any>
  >
> = Object.entries(Algorithms).map(([groupKey, values]) => ({
  key: groupKey,
  label: groupKey,
  options: Object.entries(values).map(([algorithmKey, algorithm]) => ({
    key: algorithmKey,
    label: algorithm.name,
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
