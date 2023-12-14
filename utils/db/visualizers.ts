import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as LocalDb from './local/visualizers';
import { DbVisualizer, DbVisualizerSaved } from './types';

export function useSavedVisualizersQuery() {
  return useQuery(['objects', 'visualizer'], async () => {
    return LocalDb.getSavedVisualizers();
  });
}

export function useAddSavedVisualizerMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (visualizer: DbVisualizer) => {
      return LocalDb.addSavedVisualizer(visualizer);
    },
    {
      onSuccess: ({ type }) => {
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useSetSavedVisualizerMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (visualizer: DbVisualizerSaved) => {
      return LocalDb.setSavedVisualizer(visualizer);
    },
    {
      onSuccess: ({ key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}

export function useRemoveSavedVisualizerMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    async (visualizer: DbVisualizerSaved) => {
      LocalDb.removeSavedVisualizer(visualizer);
    },
    {
      onSuccess: (_, { key, type }) => {
        queryClient.invalidateQueries(['objects', key]);
        queryClient.invalidateQueries(['objects', type]);
      },
    },
  );
}
